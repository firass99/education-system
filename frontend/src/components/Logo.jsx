import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './icons';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className={`flex items-center gap-2 text-lg font-bold ${light ? 'text-white' : 'text-slate-900'}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-sm">
        <Icon name="cap" className="h-5 w-5" />
      </span>
      EduSystem
    </Link>
  );
}
