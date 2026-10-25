import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { courseService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { CourseOverview, formatPrice } from '../../components/catalog';
import { Card, EmptyState, LinkButton, PageLoader } from '../../components/ui';

/** Public, read-only course page: information plus a call to action. No enroll/edit/delete here. */
function CourseDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { data: course, loading } = useFetch(() => courseService.getById(id, { public: true, silent: true }), [id]);

  if (loading && !course) return <PageLoader text="Loading course..." />;
  if (!course) {
    return <EmptyState title="Course not found" action={<Link to="/courses" className="text-brand-700 hover:underline">Back to courses</Link>} />;
  }

  return (
    <div>
      <Link to="/courses" className="mb-4 inline-block text-sm text-slate-600 hover:text-brand-700">← Back to courses</Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <CourseOverview course={course} />
        <Card className="h-fit">
          <p className="text-sm text-slate-500">Price</p>
          <p className="text-3xl font-bold">{formatPrice(course.price)}</p>
          <div className="mt-4 space-y-3">
            {isAuthenticated ? (
              <LinkButton to={`/dashboard/courses/${course.id}`} className="w-full">Open in my dashboard</LinkButton>
            ) : (
              <>
                <LinkButton to="/register" className="w-full">Create account to enroll</LinkButton>
                <p className="text-center text-sm text-slate-600">
                  Already a student? <Link to="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CourseDetail;
