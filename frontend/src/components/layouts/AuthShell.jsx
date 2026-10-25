import React from 'react';
import Logo from '../Logo';
import Icon from '../icons';

const points = [
  'Track progress and grades in real time',
  'Parents follow every child in one place',
  'Browse the full catalog before you sign up',
];

/** Split-screen layout shared by Login and Register. */
export default function AuthShell({ title, subtitle, children, wide = false }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo light />
        <div>
          <h2 className="text-4xl font-bold leading-tight">Learning, organised for the whole family.</h2>
          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-brand-100">
                <Icon name="check" className="h-5 w-5 shrink-0 text-white" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} EduSystem</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}>
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
