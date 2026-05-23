import { Link, useLocation } from "react-router-dom"

const NAV = [
  { to: "/", label: "首页" },
  { to: "/players", label: "球员" },
  { to: "/teams", label: "球队" },
  { to: "/compare", label: "对比" },
  { to: "/favorites", label: "收藏" },
]

export default function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-orange-500">
          <span className="text-2xl">{"\u{1F3C0}"}</span>
          <span className="hidden sm:inline">NBA Hub</span>
        </Link>
        <nav className="flex gap-1">
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to
                  ? "bg-orange-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
