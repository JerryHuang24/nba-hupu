interface Props {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = "加载失败，请稍后重试", onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <span className="text-5xl mb-4">⚠️</span>
      <p className="text-gray-300 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
        >
          重试
        </button>
      )}
    </div>
  )
}
