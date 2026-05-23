interface Props {
  count?: number
  variant?: "card" | "row"
}

export default function LoadingSkeleton({ count = 8, variant = "card" }: Props) {
  if (variant === "row") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-900 rounded-xl p-4 space-y-3 animate-pulse">
          <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto" />
          <div className="h-5 bg-gray-800 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto" />
          <div className="flex gap-2 justify-center">
            <div className="h-6 w-12 bg-gray-800 rounded" />
            <div className="h-6 w-12 bg-gray-800 rounded" />
            <div className="h-6 w-12 bg-gray-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
