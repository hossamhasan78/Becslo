'use client';

import { useEffect, useState } from 'react';

interface ConfigValues {
  base_hourly_rate?: number;
  experience_junior?: number;
  experience_mid?: number;
  experience_senior?: number;
  experience_expert?: number;
  risk_buffer_default?: number;
  profit_margin_default?: number;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<ConfigValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof ConfigValues, value: number) => {
    setConfig({ ...config, [key]: value });
  };

  if (loading) return <div className="text-gray-500">Loading configuration...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Configuration</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md">Configuration saved successfully!</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Base Pricing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Hourly Rate ($)
              </label>
              <input
                type="number"
                value={config.base_hourly_rate || 0}
                onChange={(e) => updateConfig('base_hourly_rate', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Experience Multipliers</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Junior (1-2 years)
              </label>
              <input
                type="number"
                step="0.1"
                value={config.experience_junior || 1}
                onChange={(e) => updateConfig('experience_junior', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mid-Level (3-5 years)
              </label>
              <input
                type="number"
                step="0.1"
                value={config.experience_mid || 1}
                onChange={(e) => updateConfig('experience_mid', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senior (6-10 years)
              </label>
              <input
                type="number"
                step="0.1"
                value={config.experience_senior || 1}
                onChange={(e) => updateConfig('experience_senior', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expert (10+ years)
              </label>
              <input
                type="number"
                step="0.1"
                value={config.experience_expert || 1}
                onChange={(e) => updateConfig('experience_expert', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Default Buffers</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Buffer (%)
              </label>
              <input
                type="number"
                value={config.risk_buffer_default || 0}
                onChange={(e) => updateConfig('risk_buffer_default', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profit Margin (%)
              </label>
              <input
                type="number"
                value={config.profit_margin_default || 0}
                onChange={(e) => updateConfig('profit_margin_default', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
