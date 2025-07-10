export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
          <div className="w-full h-48 bg-gray-700"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-700 rounded w-16"></div>
              <div className="h-8 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
