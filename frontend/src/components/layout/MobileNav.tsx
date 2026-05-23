import { Link, useLocation } from "react-router-dom"

const NAV = [
  { to: "/", label: "首页", icon: "\u{1F3C0}" },
  { to: "/players", label: "球员", icon: "\u{1F465}" },
  { to: "/teams", label: "球队", icon: "\u{1F3D8}" },
  { to: "/compare", label: "对比", icon: "\u{2696}" },
  { to: "/favorites", label: "收藏", icon: "\u{2B50}" },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-t border-gray-800">
      <div className="flex justify-around py-1.5">
        {NAV.map(({ to, label, icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors ${
                active ? "text-orange-500" : "text-gray-400"
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
