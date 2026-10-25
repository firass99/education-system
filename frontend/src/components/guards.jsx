import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LinkButton, PageLoader } from './ui';

/** Requires a signed-in user; optionally restricts to `roles`. Renders nested routes via <Outlet />. */
export function RequireAuth({ roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user?.role?.name)) return <Forbidden />;
  return <Outlet />;
}

/** Guest-only pages (login, register): signed-in users go to their dashboard. */
export function GuestOnly() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function Forbidden() {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-bold text-rose-500">403</p>
      <p className="mt-2 text-slate-600">You do not have permission to view this page.</p>
      <LinkButton to="/dashboard" className="mt-6">Back to dashboard</LinkButton>
    </div>
  );
}
