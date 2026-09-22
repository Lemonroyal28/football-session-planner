import type { SupabaseClient } from '@supabase/supabase-js';

export type ModuleKey =
  | 'sessions'
  | 'drills'
  | 'templates'
  | 'teams'
  | 'attendance'
  | 'tactical_board'
  | 'calendar';

export type ModuleStatus = 'granted' | 'revoked' | 'requested';

export const ALL_MODULES: ModuleKey[] = [
  'sessions',
  'drills',
  'templates',
  'teams',
  'attendance',
  'tactical_board',
  'calendar',
];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  sessions: 'Sessions',
  drills: 'Drill Library',
  templates: 'Templates',
  teams: 'Teams',
  attendance: 'Attendance',
  tactical_board: 'Tactical Board',
  calendar: 'Calendar',
};

// Ordered so the longest/most specific prefix is checked first (e.g.
// '/attendance' before a hypothetical shorter overlapping prefix).
const MODULE_ROUTE_PREFIXES: [string, ModuleKey][] = [
  ['/sessions', 'sessions'],
  ['/drills', 'drills'],
  ['/templates', 'templates'],
  ['/teams', 'teams'],
  ['/attendance', 'attendance'],
  ['/tactical-board', 'tactical_board'],
  ['/calendar', 'calendar'],
];

export function pathToModule(pathname: string): ModuleKey | null {
  for (const [prefix, module] of MODULE_ROUTE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return module;
  }
  return null;
}

function grantedMap(): Record<ModuleKey, ModuleStatus> {
  return ALL_MODULES.reduce(
    (acc, module) => ({ ...acc, [module]: 'granted' as ModuleStatus }),
    {} as Record<ModuleKey, ModuleStatus>
  );
}

/**
 * Absence of a module_access row means 'granted' — this only overlays
 * explicit revokes/requests on top of the default-open map.
 */
export async function getModuleAccessMap(
  supabase: SupabaseClient,
  profileId: string,
  role: 'admin' | 'coach' | string | null
): Promise<Record<ModuleKey, ModuleStatus>> {
  if (role === 'admin') return grantedMap();

  const map = grantedMap();
  const { data } = await supabase
    .from('module_access')
    .select('module, status')
    .eq('profile_id', profileId);

  for (const row of data ?? []) {
    map[row.module as ModuleKey] = row.status as ModuleStatus;
  }
  return map;
}

export async function hasModuleAccess(
  supabase: SupabaseClient,
  profileId: string,
  role: 'admin' | 'coach' | string | null,
  module: ModuleKey
): Promise<boolean> {
  if (role === 'admin') return true;

  const { data } = await supabase
    .from('module_access')
    .select('status')
    .eq('profile_id', profileId)
    .eq('module', module)
    .maybeSingle();

  return (data?.status ?? 'granted') === 'granted';
}

export async function requestModuleAccess(
  supabase: SupabaseClient,
  organizationId: string,
  profileId: string,
  module: ModuleKey
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('module_access').upsert(
    {
      organization_id: organizationId,
      profile_id: profileId,
      module,
      status: 'requested',
      requested_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,module' }
  );

  if (error) return { error: error.message };
  return { error: null };
}

export async function decideModuleAccess(
  supabase: SupabaseClient,
  rowId: string,
  decision: 'granted' | 'revoked'
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const { error } = await supabase
    .from('module_access')
    .update({
      status: decision,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    })
    .eq('id', rowId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function setModuleAccess(
  supabase: SupabaseClient,
  organizationId: string,
  profileId: string,
  module: ModuleKey,
  status: 'granted' | 'revoked'
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const { error } = await supabase.from('module_access').upsert(
    {
      organization_id: organizationId,
      profile_id: profileId,
      module,
      status,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,module' }
  );

  if (error) return { error: error.message };
  return { error: null };
}
