import { useState, useEffect, useCallback, createContext, useContext } from "react"

const STORAGE_KEY = "nba-hupu-favorites"

interface FavoritesContextType {
  favorites: number[]
  isFavorite: (id: number) => boolean
  toggleFavorite: (id: number) => void
}

export const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
})

export function useFavoritesProvider() {
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites]
  )

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }, [])

  return { favorites, isFavorite, toggleFavorite }
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
