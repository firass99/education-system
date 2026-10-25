import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Badge, Button, Card, Field, PageHeader } from '../../components/ui';

function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    date_of_birth: user.date_of_birth ? String(user.date_of_birth).slice(0, 10) : '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    const payload = { ...form, date_of_birth: form.date_of_birth || null };
    if (!payload.password) { delete payload.password; delete payload.password_confirmation; }
    try {
      const updated = await authService.updateProfile(payload);
      updateUser({ ...user, ...updated });
      setForm({ ...form, password: '', password_confirmation: '' });
      toast.success('Profile updated.');
    } catch (err) {
      const fe = err.response?.data?.errors || {};
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v[0]])));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="My profile" subtitle={user.email} actions={<Badge color="purple">{user.role?.name}</Badge>} />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name" error={errors.name}><input name="name" className="input" value={form.name} onChange={set} required /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" error={errors.phone}><input name="phone" className="input" value={form.phone} onChange={set} /></Field>
            <Field label="Date of birth" error={errors.date_of_birth}><input type="date" name="date_of_birth" className="input" value={form.date_of_birth} onChange={set} /></Field>
          </div>
          <Field label="Address" error={errors.address}><textarea name="address" rows="2" className="input" value={form.address} onChange={set} /></Field>
          <hr />
          <p className="text-sm font-medium text-slate-700">Change password (optional)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" error={errors.password}><input type="password" name="password" className="input" value={form.password} onChange={set} /></Field>
            <Field label="Confirm new password"><input type="password" name="password_confirmation" className="input" value={form.password_confirmation} onChange={set} /></Field>
          </div>
          <div className="flex justify-end"><Button type="submit" loading={saving}>Save changes</Button></div>
        </form>
      </Card>
    </div>
  );
}

export default Profile;
