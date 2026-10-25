import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/layouts/AuthShell';
import { Button, Field } from '../../components/ui';

const demo = [
  ['Admin', 'admin@school.com'],
  ['Student', 'student@school.com'],
  ['Parent', 'parent@school.com'],
];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);
      const from = location.state?.from;
      navigate(from ? `${from.pathname}${from.search || ''}` : '/dashboard', { replace: true });
    } catch (err) {
      // 422 toast is shown by the API interceptor
      if (!err.response) return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to access your courses and dashboard.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <input type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <input type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Your password" />
        </Field>
        <Button type="submit" loading={loading} className="w-full py-2.5">Sign in</Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        No account? <Link to="/register" className="font-medium text-brand-700 hover:underline">Create one</Link>
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="mb-2 font-semibold">Demo accounts (password: password) — click to fill</p>
        <div className="flex flex-wrap gap-2">
          {demo.map(([role, mail]) => (
            <button key={mail} type="button" className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium hover:border-brand-300 hover:text-brand-700" onClick={() => { setEmail(mail); setPassword('password'); }}>
              {role}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-sm"><Link to="/" className="text-slate-500 hover:text-brand-700">← Back to home</Link></p>
    </AuthShell>
  );
}

export default Login;
