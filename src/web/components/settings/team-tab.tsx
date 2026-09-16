'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { createInvite, type Invite, type OrganizationMember } from '../../lib/organizations';

export function TeamTab() {
  const [organizationName, setOrganizationName] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      setLoading(false);
      return;
    }
    setOrganizationId(profile.organization_id);
    setIsAdmin(profile.role === 'admin');

    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.organization_id)
      .single();
    if (org) setOrganizationName(org.name);

    const { data: memberData } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('organization_id', profile.organization_id);
    if (memberData) setMembers(memberData);

    if (profile.role === 'admin') {
      const { data: inviteData } = await supabase
        .from('invites')
        .select('id, code, role, expires_at, used_at, created_at')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });
      if (inviteData) setInvites(inviteData);
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerateInvite = async () => {
    setCreatingInvite(true);
    setError('');
    const supabase = createClient();
    const { error: inviteError } = await createInvite(supabase, organizationId, 'coach');
    if (inviteError) setError(inviteError);
    setCreatingInvite(false);
    loadData();
  };

  const handleRemoveMember = async (memberId: string) => {
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ organization_id: null, role: 'coach' })
      .eq('id', memberId);
    loadData();
  };

  const handleRoleChange = async (member: OrganizationMember, newRole: 'admin' | 'coach') => {
    const admins = members.filter((m) => m.role === 'admin');
    if (member.role === 'admin' && newRole === 'coach' && admins.length <= 1) {
      setError('An organization must have at least one admin');
      return;
    }
    const supabase = createClient();
    await supabase.from('profiles').update({ role: newRole }).eq('id', member.id);
    loadData();
  };

  if (loading) {
    return <p className="text-sm text-white/40">Loading...</p>;
  }

  if (!organizationId) {
    return <p className="text-sm text-white/40">You&apos;re not part of a club yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Club Name</label>
        <p className="text-sm text-white">{organizationName}</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-2">Members ({members.length})</h3>
        <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 last:border-b-0"
            >
              <span className="text-sm text-white/80">
                {member.full_name || 'Unnamed'} {member.id === currentUserId && <span className="text-white/30">(you)</span>}
              </span>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member, e.target.value as 'admin' | 'coach')}
                    className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    member.role === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'
                  }`}>
                    {member.role}
                  </span>
                )}
                {isAdmin && member.id !== currentUserId && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-xs text-white/30 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white/70">Invites</h3>
            <button
              onClick={handleGenerateInvite}
              disabled={creatingInvite}
              className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              {creatingInvite ? 'Generating...' : '+ Generate Invite Link'}
            </button>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
            {invites.length === 0 ? (
              <p className="px-4 py-3 text-sm text-white/30">No invites yet.</p>
            ) : (
              invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 last:border-b-0"
                >
                  <code className="text-xs text-white/70">{invite.code}</code>
                  <span className={`text-xs ${
                    invite.used_at
                      ? 'text-white/30'
                      : new Date(invite.expires_at) < new Date()
                        ? 'text-red-400'
                        : 'text-emerald-400'
                  }`}>
                    {invite.used_at ? 'Used' : new Date(invite.expires_at) < new Date() ? 'Expired' : 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
