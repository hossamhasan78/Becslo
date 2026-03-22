export default function Loading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="border-b border-gray-200">
            <div className="flex px-6 py-3 bg-gray-50">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded ml-6"></div>
              <div className="w-24 h-4 bg-gray-200 rounded ml-6"></div>
              <div className="w-24 h-4 bg-gray-200 rounded ml-6"></div>
              <div className="w-24 h-4 bg-gray-200 rounded ml-6"></div>
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex px-6 py-4 border-b border-gray-200 last:border-b-0">
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
              <div className="w-32 h-4 bg-gray-200 rounded ml-6"></div>
              <div className="w-24 h-4 bg-gray-200 rounded ml-6"></div>
              <div className="w-24 h-4 bg-gray-200 rounded ml-6"></div>
              <div className="w-24 h-4 bg-gray-200 rounded ml-6"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
