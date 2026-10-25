import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/icons';
import { Card, LinkButton } from '../../components/ui';

const values = [
  { icon: 'cap', title: 'Learner first', text: 'Every screen is designed to help students find, follow and finish courses.' },
  { icon: 'users', title: 'Family aware', text: 'Parents get visibility into their children\'s learning without needing admin help.' },
  { icon: 'shield', title: 'Secure by role', text: 'Access is granted by role, so people only see and change what they should.' },
];

export default function About() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">About EduSystem</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          EduSystem is an education management platform that brings courses, enrollments and progress tracking together for students, parents and administrators.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {values.map((v) => (
          <Card key={v.title}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon name={v.icon} className="h-6 w-6" /></span>
            <h2 className="mt-4 font-semibold text-slate-900">{v.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{v.text}</p>
          </Card>
        ))}
      </div>
      <div className="mt-12 text-center">
        <LinkButton to={isAuthenticated ? '/dashboard' : '/register'} className="px-6 py-3 text-base">{isAuthenticated ? 'Go to dashboard' : 'Join EduSystem'}</LinkButton>
      </div>
    </div>
  );
}
