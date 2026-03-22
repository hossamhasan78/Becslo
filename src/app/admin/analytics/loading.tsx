export default function AnalyticsLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
      </div>

      <div className="mb-8">
        <div className="bg-gray-200 rounded-lg h-20 animate-pulse"></div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
          <div className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
          <div className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
        </div>

        <div className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
        <div className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
      </div>
    </div>
  )
}
