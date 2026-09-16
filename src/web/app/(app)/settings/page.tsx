'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { TeamTab } from '../../../components/settings/team-tab';

type Tab = 'account' | 'team' | 'planning' | 'preferences';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Account
  const [fullName, setFullName] = useState('');
  const [clubName, setClubName] = useState('');
  const [email, setEmail] = useState('');

  // Planning defaults
  const [defaultDuration, setDefaultDuration] = useState(90);
  const [defaultAgeGroup, setDefaultAgeGroup] = useState('');
  const [defaultPitchType, setDefaultPitchType] = useState('full');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || '');

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          setClubName(profile.club_name || '');
          const prefs = profile.preferences || {};
          setDefaultDuration(prefs.default_duration || 90);
          setDefaultAgeGroup(prefs.default_age_group || '');
          setDefaultPitchType(prefs.default_pitch_type || 'full');
        }
      }

      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      setMessage('Sign in to save settings');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        club_name: clubName,
        preferences: {
          default_duration: defaultDuration,
          default_age_group: defaultAgeGroup,
          default_pitch_type: defaultPitchType,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);
    setMessage(error ? 'Failed to save' : 'Settings saved');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><p className="text-white/40 text-sm">Loading...</p></div>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'account', label: 'Account' },
    { key: 'team', label: 'Team' },
    { key: 'planning', label: 'Planning Defaults' },
    { key: 'preferences', label: 'Preferences' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-emerald-400 border-emerald-400'
                : 'text-white/50 border-transparent hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
            <input
              value={email}
              disabled
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Club Name</label>
            <input
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Your club or academy"
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>
      )}

      {/* Team tab */}
      {activeTab === 'team' && <TeamTab />}

      {/* Planning defaults tab */}
      {activeTab === 'planning' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Default Session Duration (min)</label>
            <input
              type="number"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(Number(e.target.value))}
              min={15}
              max={180}
              step={5}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Default Age Group</label>
            <select
              value={defaultAgeGroup}
              onChange={(e) => setDefaultAgeGroup(e.target.value)}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">None</option>
              {['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U21', 'Senior'].map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Default Pitch Type</label>
            <select
              value={defaultPitchType}
              onChange={(e) => setDefaultPitchType(e.target.value)}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="full">Full Pitch</option>
              <option value="half-attack">Half (Attack)</option>
              <option value="half-defend">Half (Defend)</option>
              <option value="small-sided">Small Sided</option>
              <option value="futsal">Futsal</option>
            </select>
          </div>
        </div>
      )}

      {/* Preferences tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <p className="text-sm text-white/40">
            Additional preferences like theme, notifications, and export defaults will be available in a future update.
          </p>
        </div>
      )}

      {/* Save */}
      {activeTab !== 'team' && (
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {message && (
          <span className={`text-sm ${message.includes('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>
            {message}
          </span>
        )}
      </div>
      )}
    </div>
  );
}
