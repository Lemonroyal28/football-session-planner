import { createClient } from '../../lib/supabase/server';
import { AppShell } from '../../components/layout/app-shell';
import { getModuleAccessMap } from '../../lib/access/module-access';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let moduleAccess = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    moduleAccess = await getModuleAccessMap(supabase, user.id, profile?.role ?? 'coach');
  }

  return (
    <AppShell user={user} moduleAccess={moduleAccess}>
      {children}
    </AppShell>
  );
}
