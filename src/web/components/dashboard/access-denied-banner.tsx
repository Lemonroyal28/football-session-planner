'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { requestModuleAccess, MODULE_LABELS, type ModuleKey } from '../../lib/access/module-access';

export function AccessDeniedBanner({
  module,
  organizationId,
  profileId,
}: {
  module: ModuleKey;
  organizationId: string;
  profileId: string;
}) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'requested' | 'error'>('idle');

  const handleRequest = async () => {
    setStatus('requesting');
    const supabase = createClient();
    const { error } = await requestModuleAccess(supabase, organizationId, profileId, module);
    setStatus(error ? 'error' : 'requested');
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3">
      <div className="flex items-center gap-2 text-amber-300 text-sm">
        <AlertTriangle size={16} />
        <span>You don&apos;t have access to {MODULE_LABELS[module]}.</span>
      </div>
      {status === 'requested' ? (
        <span className="text-xs text-amber-300/70">Request sent to your admin</span>
      ) : status === 'error' ? (
        <span className="text-xs text-red-400">Failed to send request — try again</span>
      ) : (
        <button
          onClick={handleRequest}
          disabled={status === 'requesting'}
          className="text-xs font-medium text-amber-300 hover:text-amber-200 underline disabled:opacity-50"
        >
          {status === 'requesting' ? 'Requesting...' : 'Request access'}
        </button>
      )}
    </div>
  );
}
