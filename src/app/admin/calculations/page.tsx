'use client';

import { createClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

interface Calculation {
  id: string;
  client_email: string;
  client_country: string;
  final_price: number;
  total_hours: number;
  experience_level: string;
  risk_buffer: number;
  profit_margin: number;
  created_at: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CalculationsPage() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCalculations = useCallback(async () => {
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setCalculations(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCalculations();
  }, [fetchCalculations]);

  if (loading) return <div className="text-gray-500">Loading calculations...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Calculations</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {calculations.map((calc) => (
              <>
                <tr key={calc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(calc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{calc.client_email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{calc.client_country}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">{calc.experience_level}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{calc.total_hours}h</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    ${calc.final_price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setExpandedId(expandedId === calc.id ? null : calc.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {expandedId === calc.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
                {expandedId === calc.id && (
                  <tr key={`${calc.id}-details`}>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Risk Buffer:</span>
                          <span className="ml-2 text-gray-900">{calc.risk_buffer}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Profit Margin:</span>
                          <span className="ml-2 text-gray-900">{calc.profit_margin}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <span className="ml-2 text-gray-900">{new Date(calc.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {calculations.length === 0 && (
          <div className="p-6 text-center text-gray-500">No calculations yet</div>
        )}
      </div>
    </div>
  );
}
