import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { navForRole } from "../../config/navigation";
import Logo from "../Logo";
import Icon from "../icons";
import { Avatar } from "../ui";

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.name;

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo to="/" light />
      </div>

      <nav
        className="flex-1 space-y-6 overflow-y-auto px-3 py-2"
        aria-label="Dashboard"
      >
        {navForRole(role).map((group) => (
          <div key={group.heading}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {group.heading}
            </p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={linkClass}
                    onClick={onNavigate}
                  >
                    <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user?.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.name}
            </p>
            <p className="truncate text-xs capitalize text-slate-400">{role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Log out"
            title="Log out"
          >
            <Icon name="logout" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Close the mobile drawer on navigation and lock body scroll while it is open
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-slate-900 lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85%] bg-slate-900 shadow-xl">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
          <button
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" className="h-6 w-6" />
          </button>
          <p className="hidden text-sm text-slate-500 lg:block">
            Signed in as{" "}
            <span className="font-medium capitalize text-slate-800">
              {user?.role?.name}
            </span>
          </p>
          <NavLink
            to="/dashboard/profile"
            className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-700"
          >
            <Avatar name={user?.name} className="h-8 w-8" />
            <span className="hidden sm:inline">{user?.name}</span>
          </NavLink>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
