import React from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services';
import useFetch from '../../hooks/useFetch';
import { Badge, Card, EmptyState, PageHeader, PageLoader, ProgressBar, statusColor } from '../../components/ui';

function Children() {
  const { data, loading } = useFetch(() => dashboardService.getStats(), []);
  if (loading) return <PageLoader />;
  if (!data || data.children.length === 0) {
    return <EmptyState title="No children linked" text="Ask an administrator to link your children's accounts to yours." />;
  }

  return (
    <div>
      <PageHeader title="My children" subtitle="Courses and progress for each child" />
      <div className="space-y-6">
        {data.children.map((c) => {
          const enrollments = data.enrollments.filter((e) => e.student_id === c.student.id && e.status !== 'dropped');
          return (
            <Card key={c.student.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{c.student.name}</h2>
                  <p className="text-sm text-slate-500">{c.student.email}</p>
                </div>
                <div className="text-sm text-slate-600">
                  {c.total_enrolled} enrolled · {c.completed} completed · avg grade {Math.round(c.average_grade)}%
                </div>
              </div>
              {enrollments.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Not enrolled in any course yet.</p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {enrollments.map((e) => (
                    <div key={e.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Link to={`/dashboard/courses/${e.course?.id}`} className="font-medium text-brand-700 hover:underline">{e.course?.title}</Link>
                        <Badge color={statusColor[e.status]}>{e.status}</Badge>
                      </div>
                      <div className="mt-2"><ProgressBar value={e.progress} /></div>
                      <p className="mt-1 text-xs text-slate-500">{e.progress}% complete{e.grade != null ? ` · grade ${e.grade}%` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Children;
