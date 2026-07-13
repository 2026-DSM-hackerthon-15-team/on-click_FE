import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="box-border w-60 shrink-0 min-h-svh border-r border-gray-200 p-4">
      <nav className="flex flex-col gap-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-gray-900 no-underline hover:bg-purple-50 ${
              isActive ? 'bg-purple-50 font-medium text-purple-600' : ''
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-gray-900 no-underline hover:bg-purple-50 ${
              isActive ? 'bg-purple-50 font-medium text-purple-600' : ''
            }`
          }
        >
          내 가게 현황
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
