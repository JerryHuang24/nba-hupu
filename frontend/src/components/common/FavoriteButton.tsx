import { useFavorites } from "../../hooks/useFavorites"

interface Props {
  playerId: number
  size?: "sm" | "md"
}

export default function FavoriteButton({ playerId, size = "md" }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(playerId)
  const sizeClass = size === "sm" ? "w-6 h-6 text-sm" : "w-8 h-8 text-lg"

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(playerId) }}
      className={`${sizeClass} rounded-full flex items-center justify-center transition-colors bg-black/40 hover:bg-black/60 backdrop-blur-sm`}
      title={fav ? "取消收藏" : "收藏"}
    >
      {fav ? "❤️" : "\u{1F90D}"}
    </button>
  )
}
