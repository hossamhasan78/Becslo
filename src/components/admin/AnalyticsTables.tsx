'use client'

import type { AnalyticsMetrics, MostUsedService, TopClientCountry } from '@/types/admin'

interface AnalyticsTablesProps {
  metrics: AnalyticsMetrics
  isEmpty: boolean
}

function MetricCard({ label, value, prefix = '', suffix = '' }: { label: string; value: string | number; prefix?: string; suffix?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</h3>
      <p className="text-3xl font-bold text-gray-900">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
    </div>
  )
}

function ServicesTable({ services }: { services: MostUsedService[] }) {
  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No service usage data available
      </div>
    )
  }

  const maxCount = Math.max(...services.map(s => s.count))

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usage Count
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Share
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((service, index) => {
            const sharePercent = maxCount > 0 ? Math.round((service.count / maxCount) * 100) : 0
            return (
              <tr key={service.service_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {service.service_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {service.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${sharePercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{sharePercent}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CountriesTable({ countries }: { countries: TopClientCountry[] }) {
  if (countries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No country data available
      </div>
    )
  }

  const maxCount = Math.max(...countries.map(c => c.count))

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Country
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Calculations
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Share
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {countries.map((country, index) => {
            const sharePercent = maxCount > 0 ? Math.round((country.count / maxCount) * 100) : 0
            return (
              <tr key={country.country_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {country.country_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {country.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${sharePercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{sharePercent}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function AnalyticsTables({ metrics, isEmpty }: AnalyticsTablesProps) {
  if (isEmpty) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Average Price</h3>
            <p className="text-3xl font-bold text-gray-400">$0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Average Hours</h3>
            <p className="text-3xl font-bold text-gray-400">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Calculations</h3>
            <p className="text-3xl font-bold text-gray-400">0</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Used Services</h3>
          <p className="text-center text-gray-500 py-8">No data available for the selected date range</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Client Countries</h3>
          <p className="text-center text-gray-500 py-8">No data available for the selected date range</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Average Price" value={metrics.average_price} prefix="$" />
        <MetricCard label="Average Hours" value={metrics.average_hours} />
        <MetricCard label="Total Calculations" value={metrics.total_calculations} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Most Used Services</h3>
          <p className="mt-1 text-sm text-gray-500">
            Top {metrics.most_used_services.length} services by usage
          </p>
        </div>
        <ServicesTable services={metrics.most_used_services} />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Client Countries</h3>
          <p className="mt-1 text-sm text-gray-500">
            Top {metrics.top_client_countries.length} countries by calculation count
          </p>
        </div>
        <CountriesTable countries={metrics.top_client_countries} />
      </div>
    </div>
  )
}
