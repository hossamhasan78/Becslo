'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalUsers: number;
  totalCalculations: number;
  averagePrice: number;
  averageHours: number;
  topServices: { serviceId: string; count: number }[];
  topCountries: { country: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setData(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading analytics...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return null;

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: '👥' },
    { label: 'Total Calculations', value: data.totalCalculations, icon: '🧮' },
    { label: 'Average Price', value: `$${data.averagePrice.toLocaleString()}`, icon: '💰' },
    { label: 'Average Hours', value: Math.round(data.averageHours), icon: '⏱️' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Services</h2>
          {data.topServices.length === 0 ? (
            <p className="text-gray-500">No data yet</p>
          ) : (
            <ul className="space-y-3">
              {data.topServices.map((s, i) => (
                <li key={s.serviceId} className="flex justify-between items-center">
                  <span className="text-gray-700">#{i + 1} {s.serviceId}</span>
                  <span className="text-gray-500">{s.count} uses</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Countries</h2>
          {data.topCountries.length === 0 ? (
            <p className="text-gray-500">No data yet</p>
          ) : (
            <ul className="space-y-3">
              {data.topCountries.map((c) => (
                <li key={c.country} className="flex justify-between items-center">
                  <span className="text-gray-700">{c.country}</span>
                  <span className="text-gray-500">{c.count} calculations</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
