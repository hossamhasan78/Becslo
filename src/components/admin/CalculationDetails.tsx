'use client'

import type { CalculationDetails as CalculationDetailsType } from '@/types/admin'

interface CalculationDetailsProps {
  details: CalculationDetailsType
}

function sanitize(str: string): string {
  return str.replace(/[<>]/g, '')
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CalculationDetails({ details }: CalculationDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">User Information</h2>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{sanitize(details.user_name)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{sanitize(details.user_email)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Pricing Model</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{sanitize(details.pricing_model)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(details.created_at)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Geographic Information</h2>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Designer Country</dt>
              <dd className="mt-1 text-sm text-gray-900">{sanitize(details.designer_country)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Client Country</dt>
              <dd className="mt-1 text-sm text-gray-900">{sanitize(details.client_country)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Designer Experience</dt>
              <dd className="mt-1 text-sm text-gray-900">{details.experience_designer} years</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Freelance Experience</dt>
              <dd className="mt-1 text-sm text-gray-900">{details.experience_freelance} years</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Services Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adjusted Rate
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {details.services.map((service, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sanitize(service.service_name)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {service.hours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${service.adjusted_rate}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    ${service.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                  Total Hours:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  {details.total_hours}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {details.costs.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Additional Costs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Item
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {details.costs.map((cost, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sanitize(cost.cost_name)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      ${cost.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pricing Summary</h2>
        </div>
        <div className="p-6">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
              <dd className="text-sm font-medium text-gray-900">${details.subtotal.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Risk Buffer</dt>
              <dd className="text-sm font-medium text-gray-900">${details.risk_buffer.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Profit Margin</dt>
              <dd className="text-sm font-medium text-gray-900">${details.profit_margin.toLocaleString()}</dd>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <dt className="text-base font-medium text-gray-900">Final Price</dt>
              <dd className="text-base font-bold text-blue-600">${details.final_price.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Multipliers Applied</h2>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Experience Multiplier</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">
                {details.multipliers.experience_multiplier}x
              </dd>
              <p className="text-xs text-gray-400 mt-1">
                ({details.experience_designer} × {details.experience_freelance})
              </p>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Geography Multiplier</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">
                {details.multipliers.geography_multiplier.toFixed(2)}x
              </dd>
              <p className="text-xs text-gray-400 mt-1">
                ({details.designer_country} → {details.client_country})
              </p>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Base Rate</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">
                ${details.multipliers.base_rate.toFixed(2)}/hr
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Recommended Price Range</h3>
        <div className="flex items-baseline gap-4">
          <div>
            <span className="text-sm text-blue-600">Minimum:</span>
            <span className="ml-2 text-xl font-bold text-blue-900">
              ${details.recommended_min.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-sm text-blue-600">Maximum:</span>
            <span className="ml-2 text-xl font-bold text-blue-900">
              ${details.recommended_max.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
