export default function CalculationDetailsLoading() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
      </div>
      <div className="space-y-6">
        <div className="bg-gray-200 rounded-lg h-40 animate-pulse"></div>
        <div className="bg-gray-200 rounded-lg h-40 animate-pulse"></div>
        <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
      </div>
    </div>
  )
}
