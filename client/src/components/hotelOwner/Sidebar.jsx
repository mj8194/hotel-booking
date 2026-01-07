import React from 'react'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const sidebarLinks =[
    {name:"Dashboard" , path: "/owner" , icon:assets.dashboardIcon },
    {name:"Add Room" , path: "/owner/add-room" , icon:assets.addIcon },
    {name:"List Room" , path: "/owner/list-room" , icon:assets.listIcon },
  ]
  return (
    <aside className="md:w-64 w-16 border-r border-gray-300 h-full pt-4 flex flex-col transition-all duration-300 bg-white">
      {sidebarLinks.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          end={item.path === "/owner"}
          className={({ isActive }) =>
            `flex items-center py-3 px-4 md:px-8 gap-3
            ${
              isActive
                ? "border-r-4 md:border-r-[6px] border-blue-600 bg-blue-600/10 text-blue-600"
                : "hover:bg-gray-100 text-gray-700"
            }`
          }
        >
          <img src={item.icon} alt={item.name} className="h-6 w-6" />
          <p className="hidden md:block">{item.name}</p>
        </NavLink>
      ))}
    </aside>
  )
}


export default Sidebar