'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import { createOrganization, redeemInvite } from '../../../../lib/organizations';

type JoinMode = 'create' | 'join';

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<JoinMode>('create');
  const [clubName, setClubName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const result = mode === 'create'
      ? await createOrganization(supabase, clubName || 'My Club')
      : await redeemInvite(supabase, inviteCode.trim());

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">One more step</h1>
          <p className="mt-2 text-sm text-white/60">Create a club or join one with an invite code</p>
        </div>

        <div className="flex rounded-md bg-white/5 border border-white/10 p-1">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === 'create' ? 'bg-emerald-600 text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Create a club
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mode === 'join' ? 'bg-emerald-600 text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Join with invite
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {mode === 'create' ? (
            <div>
              <label htmlFor="clubName" className="block text-sm font-medium text-white/70 mb-1">
                Club Name
              </label>
              <input
                id="clubName"
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                placeholder="e.g. Riverside FC"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-white/70 mb-1">
                Invite Code
              </label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                placeholder="Paste your invite code"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Club' : 'Join Club'}
          </button>
        </form>
      </div>
    </div>
  );
}
