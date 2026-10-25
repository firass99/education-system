import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { categoryService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { Badge, Button, Card, ConfirmModal, EmptyState, Field, Modal, PageHeader, PageLoader } from '../../components/ui';

const blank = { name: '', description: '', is_active: true };

function Categories() {
  const { isAdmin } = useAuth();
  const { data, loading, reload } = useFetch(() => categoryService.getAll(), []);
  const [form, setForm] = useState(null); // null = closed; object = open (with id when editing)
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <PageLoader />;

  const save = async () => {
    setBusy(true);
    setErrors({});
    try {
      const { id, ...payload } = form;
      if (id) await categoryService.update(id, payload); else await categoryService.create(payload);
      toast.success(id ? 'Category updated.' : 'Category created.');
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
      await categoryService.delete(deleting.id);
      toast.success('Category deleted.');
      setDeleting(null);
      reload();
    } catch (e) { /* interceptor toast */ } finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Browse courses by topic"
        actions={isAdmin() && <Button onClick={() => { setErrors({}); setForm(blank); }}>+ New category</Button>}
      />
      {(data || []).length === 0 ? <EmptyState title="No categories yet" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{c.name}</h3>
                {!c.is_active && <Badge color="amber">Inactive</Badge>}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{c.description || 'No description.'}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <Link to={`/dashboard/courses?category_id=${c.id}`} className="font-medium text-brand-700 hover:underline">{c.courses_count} courses</Link>
                {isAdmin() && (
                  <span className="flex gap-1">
                    <Button variant="ghost" onClick={() => { setErrors({}); setForm({ id: c.id, name: c.name, description: c.description || '', is_active: !!c.is_active }); }}>Edit</Button>
                    <Button variant="ghost" className="text-red-600" onClick={() => setDeleting(c)}>Delete</Button>
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!form}
        title={form?.id ? 'Edit category' : 'New category'}
        onClose={() => setForm(null)}
        footer={<><Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button><Button loading={busy} onClick={save}>Save</Button></>}
      >
        {form && (
          <div className="space-y-4">
            <Field label="Name" error={errors.name}>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Description" error={errors.description}>
              <textarea rows="3" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
            </label>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        title="Delete category"
        message={`Delete "${deleting?.name}"?`}
        confirmText="Delete"
        loading={busy}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

export default Categories;
