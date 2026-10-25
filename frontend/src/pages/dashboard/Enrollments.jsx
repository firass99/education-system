import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { Badge, Button, Card, ConfirmModal, EmptyState, Field, LinkButton, Modal, PageHeader, PageLoader, ProgressBar, Table, statusColor } from '../../components/ui';

function Enrollments() {
  const { isAdmin } = useAuth();
  const { data, loading, reload } = useFetch(() => enrollmentService.getAll(), []);
  const [dropping, setDropping] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [edit, setEdit] = useState({ progress: 0, grade: '' });

  if (loading && !data) return <PageLoader />;
  const rows = (data || []).filter((e) => e.status !== 'dropped');

  const drop = async () => {
    setBusy(true);
    try {
      await enrollmentService.drop(dropping.id);
      toast.success('Enrollment dropped.');
      setDropping(null);
      reload();
    } catch (e) { /* interceptor toast */ } finally { setBusy(false); }
  };

  const openEdit = (row) => {
    setEditing(row);
    setEdit({ progress: row.progress, grade: row.grade ?? '' });
  };

  const saveEdit = async () => {
    setBusy(true);
    try {
      await enrollmentService.updateProgress(editing.id, {
        progress: Number(edit.progress),
        grade: edit.grade === '' ? null : Number(edit.grade),
      });
      toast.success('Enrollment updated.');
      setEditing(null);
      reload();
    } catch (e) { /* interceptor toast */ } finally { setBusy(false); }
  };

  const columns = [
    isAdmin() && { key: 'student', header: 'Student', render: (r) => r.student?.name },
    { key: 'course', header: 'Course', render: (r) => <Link className="font-medium text-brand-700 hover:underline" to={`/dashboard/courses/${r.course?.id}`}>{r.course?.title}</Link> },
    { key: 'status', header: 'Status', render: (r) => <Badge color={statusColor[r.status]}>{r.status}</Badge> },
    { key: 'progress', header: 'Progress', render: (r) => <div className="w-32"><ProgressBar value={r.progress} /><span className="text-xs text-slate-500">{r.progress}%</span></div> },
    { key: 'grade', header: 'Grade', render: (r) => (r.grade != null ? `${r.grade}%` : '-') },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="flex gap-2">
          {isAdmin() && <Button variant="secondary" onClick={() => openEdit(r)}>Edit</Button>}
          {r.status === 'active' && <Button variant="ghost" className="text-red-600" onClick={() => setDropping(r)}>Drop</Button>}
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader title={isAdmin() ? 'All enrollments' : 'My enrollments'} />
      {rows.length === 0 ? (
        <EmptyState title="No enrollments yet" action={<LinkButton to="/dashboard/courses">Browse courses</LinkButton>} />
      ) : (
        <Card><Table rows={rows} columns={columns} /></Card>
      )}

      <ConfirmModal
        open={!!dropping}
        title="Drop course"
        message={`Drop "${dropping?.course?.title}"? You can enroll again later, but progress will be reset.`}
        confirmText="Drop course"
        loading={busy}
        onConfirm={drop}
        onClose={() => setDropping(null)}
      />

      <Modal
        open={!!editing}
        title={`Update ${editing?.student?.name} — ${editing?.course?.title}`}
        onClose={() => setEditing(null)}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button loading={busy} onClick={saveEdit}>Save</Button></>}
      >
        <div className="space-y-4">
          <Field label="Progress (0-100)" hint="Reaching 100 marks the course as completed">
            <input type="number" min="0" max="100" className="input" value={edit.progress} onChange={(e) => setEdit({ ...edit, progress: e.target.value })} />
          </Field>
          <Field label="Grade (0-100)">
            <input type="number" min="0" max="100" className="input" value={edit.grade} onChange={(e) => setEdit({ ...edit, grade: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

export default Enrollments;
