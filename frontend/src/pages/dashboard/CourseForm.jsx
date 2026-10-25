import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courseService, categoryService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Field, PageHeader, PageLoader } from '../../components/ui';

const empty = {
  title: '', description: '', category_id: '', level: 'beginner', price: 0,
  duration_hours: '', max_students: '', image: '', is_published: true,
};

function CourseForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
    if (editing) {
      courseService.getById(id)
        .then((c) => setForm({
          title: c.title, description: c.description || '', category_id: c.category_id, level: c.level,
          price: c.price, duration_hours: c.duration_hours || '', max_students: c.max_students || '',
          image: c.image || '', is_published: !!c.is_published,
        }))
        .catch(() => navigate('/dashboard/courses'))
        .finally(() => setLoading(false));
    }
  }, [id, editing, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    const payload = {
      ...form,
      instructor_id: user.id,
      duration_hours: form.duration_hours === '' ? null : Number(form.duration_hours),
      max_students: form.max_students === '' ? null : Number(form.max_students),
      image: form.image || null,
    };
    try {
      const saved = editing ? await courseService.update(id, payload) : await courseService.create(payload);
      toast.success(editing ? 'Course updated.' : 'Course created.');
      navigate(`/dashboard/courses/${saved.id}`);
    } catch (err) {
      const fe = err.response?.data?.errors || {};
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v[0]])));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={editing ? 'Edit course' : 'New course'} actions={<Link to="/dashboard/courses" className="text-sm text-slate-600 hover:text-brand-700">Cancel</Link>} />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title" error={errors.title}>
            <input name="title" className="input" value={form.title} onChange={handleChange} required />
          </Field>
          <Field label="Description" error={errors.description}>
            <textarea name="description" rows="4" className="input" value={form.description} onChange={handleChange} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category_id}>
              <select name="category_id" className="input" value={form.category_id} onChange={handleChange} required>
                <option value="">Select...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Level" error={errors.level}>
              <select name="level" className="input" value={form.level} onChange={handleChange}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
            <Field label="Price ($)" error={errors.price}>
              <input type="number" min="0" step="0.01" name="price" className="input" value={form.price} onChange={handleChange} required />
            </Field>
            <Field label="Duration (hours)" error={errors.duration_hours}>
              <input type="number" min="1" name="duration_hours" className="input" value={form.duration_hours} onChange={handleChange} />
            </Field>
            <Field label="Max students" error={errors.max_students} hint="Leave empty for unlimited">
              <input type="number" min="1" name="max_students" className="input" value={form.max_students} onChange={handleChange} />
            </Field>
            <Field label="Image URL" error={errors.image}>
              <input name="image" className="input" value={form.image} onChange={handleChange} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} />
            Published (visible to students)
          </label>
          <div className="flex justify-end gap-2">
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Create course'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CourseForm;
