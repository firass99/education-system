import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courseService, enrollmentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { CourseOverview, formatPrice } from '../../components/catalog';
import { Badge, Button, Card, ConfirmModal, EmptyState, LinkButton, PageLoader, ProgressBar, statusColor } from '../../components/ui';

/** Dashboard course page: enroll (students), edit/delete (admins). */
function CourseDetail() {
  const { id } = useParams();
  const { isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const { data: course, loading, reload } = useFetch(() => courseService.getById(id), [id]);
  const [enrolling, setEnrolling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading && !course) return <PageLoader text="Loading course..." />;
  if (!course) return <EmptyState title="Course not found" action={<Link to="/dashboard/courses" className="text-brand-700 hover:underline">Back to courses</Link>} />;

  const enrollment = course.enrollment;
  const canEnroll = isStudent() && !enrollment && course.is_published;
  const full = course.max_students && course.enrollments_count >= course.max_students;

  const enroll = async () => {
    setEnrolling(true);
    try {
      await enrollmentService.enroll(course.id);
      toast.success('You are now enrolled in this course!');
      reload();
    } catch (e) { /* toast shown by interceptor */ } finally { setEnrolling(false); }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await courseService.delete(course.id);
      toast.success('Course deleted.');
      navigate('/dashboard/courses');
    } catch (e) { setDeleting(false); setConfirmDelete(false); }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/dashboard/courses" className="text-sm text-slate-600 hover:text-brand-700">← Back to courses</Link>
        {isAdmin() && (
          <div className="flex gap-2">
            <LinkButton to={`/dashboard/courses/${course.id}/edit`} variant="secondary">Edit</LinkButton>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CourseOverview course={course} extraBadges={enrollment && <Badge color={statusColor[enrollment.status]}>{enrollment.status}</Badge>}>
          {enrollment && (
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <h3 className="font-semibold">Your progress</h3>
              <div className="mt-2"><ProgressBar value={enrollment.progress} /></div>
              <p className="mt-1 text-sm text-slate-600">{enrollment.progress}% complete</p>
              {enrollment.grade != null && <p className="mt-1 text-sm">Grade: <strong>{enrollment.grade}%</strong></p>}
            </div>
          )}
        </CourseOverview>

        <Card className="h-fit">
          <p className="text-sm text-slate-500">Price</p>
          <p className="text-3xl font-bold">{formatPrice(course.price)}</p>
          <div className="mt-4 space-y-3">
            {canEnroll && <Button className="w-full" loading={enrolling} disabled={!!full} onClick={enroll}>{full ? 'Course full' : 'Enroll now'}</Button>}
            {enrollment && <LinkButton to="/dashboard/enrollments" variant="secondary" className="w-full">View my enrollments</LinkButton>}
            {!canEnroll && !enrollment && !isAdmin() && (
              <p className="text-sm text-slate-500">{isStudent() ? 'This course is not open for enrollment.' : 'Only student accounts can enroll in courses.'}</p>
            )}
          </div>
        </Card>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete course"
        message={`Delete "${course.title}"? This will also remove its enrollments and cannot be undone.`}
        confirmText="Delete"
        loading={deleting}
        onConfirm={remove}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export default CourseDetail;
