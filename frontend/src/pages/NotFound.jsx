import React from 'react';
import { LinkButton } from '../components/ui';

export default function NotFound({ home = '/' }) {
  return (
    <div className="py-24 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
      <LinkButton to={home} className="mt-6">Go back</LinkButton>
    </div>
  );
}
