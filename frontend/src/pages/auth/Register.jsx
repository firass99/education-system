import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import AuthShell from '../../components/layouts/AuthShell';
import { Button, Field } from '../../components/ui';

function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '',
    role: 'student', phone: '', address: '', date_of_birth: '', parent_id: '',
  });
  const [parents, setParents] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    authService.getParents().then(setParents).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => payload[k] === '' && delete payload[k]);
      if (payload.role !== 'student') { delete payload.parent_id; delete payload.date_of_birth; }
      await register(payload);
      toast.success('Account created. Welcome!');
      navigate('/dashboard');
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {};
      setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v[0]])));
    } finally {
      setLoading(false);
    }
  };

  const err = (k) => errors[k];

  return (
    <AuthShell wide title="Create your account" subtitle="Join as a student or parent in under a minute.">
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="I am a" error={err('role')}>
            <select name="role" className="input" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="parent">Parent / Guardian</option>
            </select>
          </Field>
          <Field label="Full name" error={err('name')}>
            <input name="name" className="input" value={form.name} onChange={handleChange} required />
          </Field>
          <Field label="Email" error={err('email')}>
            <input type="email" name="email" className="input" value={form.email} onChange={handleChange} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Password" error={err('password')} hint="At least 8 characters">
              <input type="password" name="password" className="input" value={form.password} onChange={handleChange} required />
            </Field>
            <Field label="Confirm password">
              <input type="password" name="password_confirmation" className="input" value={form.password_confirmation} onChange={handleChange} required />
            </Field>
          </div>

          {form.role === 'student' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Parent / Guardian (optional)" error={err('parent_id')}>
                <select name="parent_id" className="input" value={form.parent_id} onChange={handleChange}>
                  <option value="">None</option>
                  {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Date of birth" error={err('date_of_birth')}>
                <input type="date" name="date_of_birth" className="input" value={form.date_of_birth} onChange={handleChange} />
              </Field>
            </div>
          )}

          <Field label="Phone" error={err('phone')}>
            <input name="phone" className="input" value={form.phone} onChange={handleChange} />
          </Field>
          <Field label="Address" error={err('address')}>
            <textarea name="address" rows="2" className="input" value={form.address} onChange={handleChange} />
          </Field>

          <Button type="submit" loading={loading} className="w-full py-2.5">Create account</Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default Register;
