import type { SupabaseClient } from '@supabase/supabase-js';

export interface OrganizationMember {
  id: string;
  full_name: string | null;
  role: 'admin' | 'coach';
}

export interface Invite {
  id: string;
  code: string;
  role: 'admin' | 'coach';
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export async function getCurrentOrganizationId(supabase: SupabaseClient): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  return data?.organization_id ?? null;
}

export async function createOrganization(
  supabase: SupabaseClient,
  name: string
): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, created_by: user.id })
    .select('id')
    .single();

  if (orgError || !org) return { error: orgError?.message ?? 'Failed to create organization' };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ organization_id: org.id, role: 'admin' })
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };
  return { error: null };
}

export async function redeemInvite(
  supabase: SupabaseClient,
  code: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('redeem_invite', { invite_code: code });
  if (error) return { error: error.message };
  return { error: null };
}

export async function createInvite(
  supabase: SupabaseClient,
  organizationId: string,
  role: 'admin' | 'coach' = 'coach'
): Promise<{ invite: Invite | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { invite: null, error: 'Not signed in' };

  const { data, error } = await supabase
    .from('invites')
    .insert({ organization_id: organizationId, role, created_by: user.id })
    .select('id, code, role, expires_at, used_at, created_at')
    .single();

  if (error || !data) return { invite: null, error: error?.message ?? 'Failed to create invite' };
  return { invite: data, error: null };
}
