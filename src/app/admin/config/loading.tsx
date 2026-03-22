export default function ConfigLoading() {
  return (
    <div className="p-8">
      <div className="animate-pulse space-y-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
          <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
          <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  )
}
