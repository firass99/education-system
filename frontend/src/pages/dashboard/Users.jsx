import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userService, authService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { Badge, Button, Card, ConfirmModal, Field, Modal, PageHeader, Table } from '../../components/ui';

const roleColor = { admin: 'purple', student: 'blue', parent: 'green' };
const blank = { name: '', email: '', password: '', role_id: '', parent_id: '', phone: '' };

function Users() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [query, setQuery] = useState({ search: '', role: '' });
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQuery({ search, role }), 300);
    return () => clearTimeout(t);
  }, [search, role]);

  // The public /auth/roles endpoint hides admin, so build the list from the users themselves when needed
  const { data: users, loading, reload } = useFetch(() => {
    const params = Object.fromEntries(Object.entries(query).filter(([, v]) => v));
    return userService.getAll(params);
  }, [query]);

  useEffect(() => {
    authService.getRoles().then((r) => setRoles(r)).catch(() => {});
  }, []);

  const parents = (users || []).filter((u) => u.role?.name === 'parent');
  const allRoles = [...roles];
  if (!allRoles.find((r) => r.name === 'admin')) {
    const adminRole = (users || []).find((u) => u.role?.name === 'admin')?.role;
    if (adminRole) allRoles.push(adminRole);
  }

  const openEdit = (u) => {
    setErrors({});
    setForm({ id: u.id, name: u.name, email: u.email, password: '', role_id: u.role_id, parent_id: u.parent_id || '', phone: u.phone || '' });
  };

  const save = async () => {
    setBusy(true);
    setErrors({});
    const { id, ...rest } = form;
    const payload = { ...rest, parent_id: rest.parent_id || null, phone: rest.phone || null };
    if (!payload.password) delete payload.password;
    try {
      if (id) await userService.update(id, payload); else await userService.create(payload);
      toast.success(id ? 'User updated.' : 'User created.');
      setForm(null);
      reload();
    } catch (err) {
      const fe = err.response?.data?.errors || {};
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v[0]])));
    } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await userService.delete(deleting.id);
      toast.success('User deleted.');
      setDeleting(null);
      reload();
    } catch (e) { setDeleting(null); } finally { setBusy(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage accounts and roles" actions={<Button onClick={() => { setErrors({}); setForm(blank); }}>+ New user</Button>} />
      <Card className="mb-4 grid gap-3 sm:grid-cols-3">
        <input className="input sm:col-span-2" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
      </Card>
      <Card>
        <Table
          rows={users || []}
          empty={loading ? 'Loading...' : 'No users found'}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role', render: (u) => <Badge color={roleColor[u.role?.name]}>{u.role?.name}</Badge> },
            { key: 'phone', header: 'Phone', render: (u) => u.phone || '-' },
            {
              key: 'actions', header: '',
              render: (u) => (
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => openEdit(u)}>Edit</Button>
                  {u.id !== me.id && <Button variant="ghost" className="text-red-600" onClick={() => setDeleting(u)}>Delete</Button>}
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!form}
        title={form?.id ? 'Edit user' : 'New user'}
        onClose={() => setForm(null)}
        footer={<><Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button><Button loading={busy} onClick={save}>Save</Button></>}
      >
        {form && (
          <div className="space-y-4">
            <Field label="Name" error={errors.name}><input className="input" value={form.name} onChange={set('name')} /></Field>
            <Field label="Email" error={errors.email}><input type="email" className="input" value={form.email} onChange={set('email')} /></Field>
            <Field label={form.id ? 'New password (optional)' : 'Password'} error={errors.password}>
              <input type="password" className="input" value={form.password} onChange={set('password')} />
            </Field>
            <Field label="Role" error={errors.role_id}>
              <select className="input" value={form.role_id} onChange={set('role_id')} disabled={form.id === me.id}>
                <option value="">Select...</option>
                {allRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Parent (for students)" error={errors.parent_id}>
              <select className="input" value={form.parent_id} onChange={set('parent_id')}>
                <option value="">None</option>
                {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Phone" error={errors.phone}><input className="input" value={form.phone} onChange={set('phone')} /></Field>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        title="Delete user"
        message={`Delete ${deleting?.name}? This cannot be undone.`}
        confirmText="Delete"
        loading={busy}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export default Users;
