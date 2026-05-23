import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"
import MobileNav from "./components/layout/MobileNav"
import HomePage from "./pages/HomePage"
import PlayersPage from "./pages/PlayersPage"
import PlayerDetailPage from "./pages/PlayerDetailPage"
import ComparePage from "./pages/ComparePage"
import TeamsPage from "./pages/TeamsPage"
import TeamDetailPage from "./pages/TeamDetailPage"
import FavoritesPage from "./pages/FavoritesPage"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-20 md:pb-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:id" element={<PlayerDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </BrowserRouter>
  )
}
