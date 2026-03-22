export default function CalculationsLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
      </div>

      <div className="mb-8">
        <div className="bg-gray-200 rounded-lg h-20 animate-pulse"></div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-200 rounded-lg h-12 animate-pulse"></div>
        <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
      </div>
    </div>
  )
}
