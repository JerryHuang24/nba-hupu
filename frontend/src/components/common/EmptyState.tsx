interface Props {
  title: string
  description?: string
  icon?: string
}

export default function EmptyState({ title, description, icon = "\u{1F3C0}" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-sm">{description}</p>}
    </div>
  )
}
