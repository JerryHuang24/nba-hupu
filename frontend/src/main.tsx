import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App"
import { FavoritesContext, useFavoritesProvider } from "./hooks/useFavorites"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const fav = useFavoritesProvider()
  return (
    <FavoritesContext.Provider value={fav}>
      {children}
    </FavoritesContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
