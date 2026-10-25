import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Logo";
import Icon from "../icons";
import { Avatar, LinkButton } from "../ui";
import { publicNav } from "../../config/navigation";

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "text-brand-700" : "text-slate-600 hover:text-slate-900"}`;

/** Auth actions: Sign in / Get started for guests, Dashboard + Log out for signed-in users. */
function AuthActions({ stacked = false }) {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const item = stacked ? "flex-1" : "";

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  if (loading) return null; // avoid flashing guest buttons while the session is restored

  if (user) {
    return (
      <>
        <LinkButton to="/dashboard" className={item}>
          <Avatar name={user.name} className="h-6 w-6 !bg-white/20 !text-xs !text-white" />
          Dashboard
        </LinkButton>
        <LinkButton as="button" variant="secondary" className={item} onClick={handleLogout}>
          Log out
        </LinkButton>
      </>
    );
  }
  return (
    <>
      <LinkButton to="/login" variant={stacked ? "secondary" : "ghost"} className={item}>
        Sign in
      </LinkButton>
      <LinkButton to="/register" className={item}>
        Get started
      </LinkButton>
    </>
  );
}

function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {publicNav.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <AuthActions />
        </div>
        <button
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <Icon name={open ? "x" : "menu"} className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <div
          className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden"
          onClick={() => setOpen(false)}
        >
          {publicNav.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={(s) => `block ${linkClass(s)}`}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <AuthActions stacked />
          </div>
        </div>
      )}
    </header>
  );
}

function PublicFooter() {
  const { user } = useAuth();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            A simple, connected place for students, parents and administrators
            to manage learning.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/courses" className="hover:text-brand-700">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-brand-700">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-brand-700">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {user ? (
              <li>
                <Link to="/dashboard" className="hover:text-brand-700">
                  Go to dashboard
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-brand-700">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-brand-700">
                    Create account
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} EduSystem. All rights reserved.
      </p>
    </footer>
  );
}

/** Shell for guest pages. `contained` wraps content in the standard max-width container. */
export default function PublicLayout({ contained = true }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main
        className={`flex-1 ${contained ? "mx-auto w-full max-w-7xl px-4 py-8" : ""}`}
      >
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
