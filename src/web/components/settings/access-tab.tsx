'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import {
  ALL_MODULES,
  MODULE_LABELS,
  decideModuleAccess,
  requestModuleAccess,
  setModuleAccess,
  type ModuleKey,
  type ModuleStatus,
} from '../../lib/access/module-access';

interface Member {
  id: string;
  full_name: string | null;
  role: 'admin' | 'coach';
}

interface AccessRow {
  id: string;
  profile_id: string;
  module: ModuleKey;
  status: ModuleStatus;
}

export function AccessTab() {
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [accessRows, setAccessRows] = useState<AccessRow[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);

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

    if (profile.role === 'admin') {
      const { data: memberData } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('organization_id', profile.organization_id)
        .neq('id', user.id)
        .neq('role', 'admin');
      if (memberData) setMembers(memberData);

      const { data: rows } = await supabase
        .from('module_access')
        .select('id, profile_id, module, status')
        .eq('organization_id', profile.organization_id);
      if (rows) setAccessRows(rows);
    } else {
      const { data: rows } = await supabase
        .from('module_access')
        .select('id, profile_id, module, status')
        .eq('profile_id', user.id);
      if (rows) setAccessRows(rows);
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const statusFor = (profileId: string, module: ModuleKey): ModuleStatus =>
    accessRows.find((r) => r.profile_id === profileId && r.module === module)?.status ?? 'granted';

  const handleRequest = async (module: ModuleKey) => {
    setBusyKey(`self-${module}`);
    const supabase = createClient();
    await requestModuleAccess(supabase, organizationId, currentUserId, module);
    await loadData();
    setBusyKey(null);
  };

  const handleToggle = async (profileId: string, module: ModuleKey, current: ModuleStatus) => {
    const next = current === 'granted' ? 'revoked' : 'granted';
    setBusyKey(`${profileId}-${module}`);
    const supabase = createClient();
    await setModuleAccess(supabase, organizationId, profileId, module, next);
    await loadData();
    setBusyKey(null);
  };

  const handleDecide = async (rowId: string, decision: 'granted' | 'revoked') => {
    setBusyKey(rowId);
    const supabase = createClient();
    await decideModuleAccess(supabase, rowId, decision);
    await loadData();
    setBusyKey(null);
  };

  if (loading) {
    return <p className="text-sm text-white/40">Loading...</p>;
  }

  if (!organizationId) {
    return <p className="text-sm text-white/40">You&apos;re not part of a club yet.</p>;
  }

  const pendingRequests = accessRows.filter((r) => r.status === 'requested');

  if (!isAdmin) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/70 mb-2">Your Module Access</h3>
        <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
          {ALL_MODULES.map((module) => {
            const status = statusFor(currentUserId, module);
            return (
              <div
                key={module}
                className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 last:border-b-0"
              >
                <span className="text-sm text-white/80">{MODULE_LABELS[module]}</span>
                {status === 'granted' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Granted</span>
                )}
                {status === 'requested' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Requested</span>
                )}
                {status === 'revoked' && (
                  <button
                    onClick={() => handleRequest(module)}
                    disabled={busyKey === `self-${module}`}
                    className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                  >
                    {busyKey === `self-${module}` ? 'Requesting...' : 'Request access'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-2">Pending Requests ({pendingRequests.length})</h3>
          <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
            {pendingRequests.map((row) => {
              const member = members.find((m) => m.id === row.profile_id);
              return (
                <div
                  key={row.id}
                  className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 last:border-b-0"
                >
                  <span className="text-sm text-white/80">
                    {member?.full_name || 'Unnamed'} <span className="text-white/30">wants {MODULE_LABELS[row.module]}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDecide(row.id, 'granted')}
                      disabled={busyKey === row.id}
                      className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecide(row.id, 'revoked')}
                      disabled={busyKey === row.id}
                      className="text-xs text-white/40 hover:text-red-400 disabled:opacity-50"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-2">Member Access</h3>
        {members.length === 0 ? (
          <p className="text-sm text-white/30">No coaches to manage yet.</p>
        ) : (
          <div className="rounded-lg bg-white/5 border border-white/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-2 text-white/50 font-medium">Member</th>
                  {ALL_MODULES.map((module) => (
                    <th key={module} className="px-3 py-2 text-white/50 font-medium text-center whitespace-nowrap">
                      {MODULE_LABELS[module]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 py-2.5 text-white/80 whitespace-nowrap">{member.full_name || 'Unnamed'}</td>
                    {ALL_MODULES.map((module) => {
                      const status = statusFor(member.id, module);
                      const key = `${member.id}-${module}`;
                      return (
                        <td key={module} className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => handleToggle(member.id, module, status)}
                            disabled={busyKey === key || status === 'requested'}
                            title={status === 'requested' ? 'Pending request — decide above' : undefined}
                            className={`text-xs px-2 py-0.5 rounded-full transition-colors disabled:opacity-50 ${
                              status === 'granted'
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : status === 'requested'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-white/10 text-white/40 hover:bg-white/20'
                            }`}
                          >
                            {status}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
