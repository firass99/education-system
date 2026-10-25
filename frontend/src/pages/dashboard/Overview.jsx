import React from 'react';
import { Link } from 'react-router-dom';
import { categoryService, dashboardService, enrollmentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import Icon from '../../components/icons';
import CourseImage from '../../components/CourseImage';
import { BarList, ColumnChart, DonutChart, TrendChart, chartColors } from '../../components/charts';
import {
  Badge, Card, EmptyState, LinkButton, PageHeader, ProgressBar, SectionTitle, Skeleton, StatCard, Table, statusColor,
} from '../../components/ui';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
const statusSlices = (active, completed, dropped) => [
  { label: 'Active', value: active, color: chartColors.active },
  { label: 'Completed', value: completed, color: chartColors.completed },
  { label: 'Dropped', value: dropped, color: chartColors.dropped },
];

/** Enrollments per month for the last `n` months (oldest first). */
function monthlyTrend(enrollments, n = 6) {
  const now = new Date();
  const buckets = Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en', { month: 'short' }), value: 0 };
  });
  enrollments.forEach((e) => {
    const raw = e.enrolled_at || e.created_at;
    if (!raw) return;
    const d = new Date(raw);
    const b = buckets.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (b) b.value += 1;
  });
  return buckets;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      <div className="grid gap-6 lg:grid-cols-3"><Skeleton className="h-72 lg:col-span-2" /><Skeleton className="h-72" /></div>
    </div>
  );
}

function AdminDashboard({ stats, enrollments, categories }) {
  const dropped = Math.max(stats.total_enrollments - stats.active_enrollments - stats.completed_enrollments, 0);
  const completionRate = stats.total_enrollments ? Math.round((stats.completed_enrollments / stats.total_enrollments) * 100) : 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={stats.total_students} icon="cap" hint={`${stats.total_parents} parents`} />
        <StatCard label="Courses" value={`${stats.published_courses}/${stats.total_courses}`} icon="book" tone="amber" hint={`${stats.total_categories} categories`} />
        <StatCard label="Active enrollments" value={stats.active_enrollments} icon="list" tone="sky" hint={`${stats.total_enrollments} in total`} />
        <StatCard label="Completion rate" value={`${completionRate}%`} icon="trophy" tone="green" hint={`${stats.completed_enrollments} completed`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle>Enrollments — last 6 months</SectionTitle>
          <TrendChart data={monthlyTrend(enrollments)} />
        </Card>
        <Card>
          <SectionTitle>Enrollment status</SectionTitle>
          <DonutChart data={statusSlices(stats.active_enrollments, stats.completed_enrollments, dropped)} centerLabel="Enrollments" />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle action={<Link to="/dashboard/courses" className="text-sm font-medium text-brand-700 hover:underline">All courses</Link>}>Popular courses</SectionTitle>
          <BarList data={stats.popular_courses.map((c) => ({ label: c.title, value: c.enrollments_count }))} format={(v) => `${v} active`} />
        </Card>
        <Card>
          <SectionTitle action={<Link to="/dashboard/categories" className="text-sm font-medium text-brand-700 hover:underline">Manage</Link>}>Courses per category</SectionTitle>
          <BarList
            color={chartColors.teal}
            data={categories.map((c) => ({ label: c.name, value: c.courses_count || 0 })).sort((a, b) => b.value - a.value).slice(0, 6)}
            format={(v) => `${v} courses`}
          />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle action={<Link to="/dashboard/enrollments" className="text-sm font-medium text-brand-700 hover:underline">View all</Link>}>Recent enrollments</SectionTitle>
          <Table
            rows={stats.recent_enrollments}
            empty="No enrollments yet"
            columns={[
              { key: 'student', header: 'Student', render: (r) => r.student?.name },
              { key: 'course', header: 'Course', render: (r) => r.course?.title },
              { key: 'status', header: 'Status', render: (r) => <Badge color={statusColor[r.status]}>{r.status}</Badge> },
              { key: 'enrolled_at', header: 'Date', render: (r) => fmtDate(r.enrolled_at || r.created_at) },
            ]}
          />
        </Card>
        <Card>
          <SectionTitle>Quick actions</SectionTitle>
          <div className="flex flex-col gap-2">
            <LinkButton to="/dashboard/courses/create"><Icon name="plus" className="h-4 w-4" /> New course</LinkButton>
            <LinkButton to="/dashboard/categories" variant="secondary">Manage categories</LinkButton>
            <LinkButton to="/dashboard/users" variant="secondary">Manage users</LinkButton>
          </div>
        </Card>
      </div>
    </>
  );
}

function StudentDashboard({ stats }) {
  const list = stats.enrollments.filter((e) => e.status !== 'dropped');
  const dropped = stats.enrollments.length - list.length;
  const active = list.filter((e) => e.status === 'active');

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled" value={stats.total_enrolled} icon="book" />
        <StatCard label="Completed" value={stats.completed} icon="trophy" tone="green" />
        <StatCard label="In progress" value={stats.in_progress} icon="clock" tone="amber" />
        <StatCard label="Average grade" value={stats.average_grade ? `${Math.round(stats.average_grade)}%` : '—'} icon="chart" tone="sky" hint={`${Math.round(stats.average_progress)}% avg. progress`} />
      </div>

      {stats.enrollments.length > 0 && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <SectionTitle>Progress by course</SectionTitle>
            <ColumnChart data={active.map((e) => ({ label: e.course?.title, value: Number(e.progress) || 0 }))} empty="No active courses" />
          </Card>
          <Card>
            <SectionTitle>My courses by status</SectionTitle>
            <DonutChart data={statusSlices(stats.in_progress, stats.completed, dropped)} centerLabel="Courses" />
          </Card>
        </div>
      )}

      <SectionTitle action={<Link to="/dashboard/courses" className="text-sm font-medium text-brand-700 hover:underline">Browse catalog</Link>}>
        <span className="mt-8 block">My courses</span>
      </SectionTitle>
      {list.length === 0 ? (
        <EmptyState title="No courses yet" text="Browse the catalog and enroll in your first course." action={<LinkButton to="/dashboard/courses">Browse courses</LinkButton>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((enr) => (
            <Card key={enr.id} className="overflow-hidden !p-0">
              <CourseImage course={enr.course} className="h-32 w-full" />
              <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{enr.course?.title}</h3>
                <Badge color={statusColor[enr.status]}>{enr.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{enr.course?.category?.name}</p>
              <div className="mt-4"><ProgressBar value={enr.progress} /></div>
              <p className="mt-1 text-xs text-slate-500">{enr.progress}% complete{enr.grade != null ? ` · grade ${enr.grade}%` : ''}</p>
              <Link to={`/dashboard/courses/${enr.course?.id}`} className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">View course →</Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function ParentDashboard({ stats }) {
  const totalEnrolled = stats.children.reduce((s, c) => s + c.total_enrolled, 0);
  const totalCompleted = stats.children.reduce((s, c) => s + c.completed, 0);
  const active = stats.enrollments.filter((e) => e.status === 'active').length;
  const dropped = stats.enrollments.filter((e) => e.status === 'dropped').length;

  if (stats.children.length === 0) {
    return <EmptyState title="No children linked" text="Ask an administrator to link your children's accounts." />;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Children" value={stats.children.length} icon="users" />
        <StatCard label="Enrollments" value={totalEnrolled} icon="book" tone="sky" />
        <StatCard label="Completed" value={totalCompleted} icon="trophy" tone="green" />
        <StatCard label="In progress" value={active} icon="clock" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle>Average progress per child</SectionTitle>
          <ColumnChart data={stats.children.map((c) => ({ label: c.student.name, value: Math.round(c.average_progress) }))} />
        </Card>
        <Card>
          <SectionTitle>Enrollment status</SectionTitle>
          <DonutChart data={statusSlices(active, totalCompleted, dropped)} centerLabel="Enrollments" />
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.children.map((c) => (
          <Card key={c.student.id}>
            <h3 className="font-semibold">{c.student.name}</h3>
            <p className="text-sm text-slate-500">{c.student.email}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div><dt className="text-slate-500">Enrolled</dt><dd className="font-bold">{c.total_enrolled}</dd></div>
              <div><dt className="text-slate-500">Done</dt><dd className="font-bold">{c.completed}</dd></div>
              <div><dt className="text-slate-500">Avg. grade</dt><dd className="font-bold">{c.average_grade ? `${Math.round(c.average_grade)}%` : '—'}</dd></div>
            </dl>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <SectionTitle action={<Link to="/dashboard/children" className="text-sm font-medium text-brand-700 hover:underline">Details</Link>}>Enrollments</SectionTitle>
        <Table
          rows={stats.enrollments}
          empty="No enrollments yet"
          columns={[
            { key: 'student', header: 'Student', render: (r) => r.student?.name },
            { key: 'course', header: 'Course', render: (r) => r.course?.title },
            { key: 'status', header: 'Status', render: (r) => <Badge color={statusColor[r.status]}>{r.status}</Badge> },
            { key: 'progress', header: 'Progress', render: (r) => `${r.progress}%` },
            { key: 'grade', header: 'Grade', render: (r) => (r.grade != null ? `${r.grade}%` : 'N/A') },
          ]}
        />
      </Card>
    </>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const role = user?.role?.name;

  // Admin additionally pulls all enrollments (trend chart) and categories (distribution chart)
  const { data, loading } = useFetch(async () => {
    const stats = await dashboardService.getStats();
    if (role !== 'admin') return { stats };
    const [enrollments, categories] = await Promise.all([enrollmentService.getAll(), categoryService.getAll()]);
    return { stats, enrollments, categories };
  }, [role]);

  if (loading && !data) return <DashboardSkeleton />;
  if (!data) return <EmptyState title="Could not load dashboard" text="Please try again later." />;

  const subtitles = {
    admin: 'Platform overview and activity.',
    student: 'Your learning at a glance.',
    parent: 'How your children are doing.',
  };

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0]}`} subtitle={subtitles[role]} />
      {role === 'admin' && <AdminDashboard stats={data.stats} enrollments={data.enrollments} categories={data.categories} />}
      {role === 'student' && <StudentDashboard stats={data.stats} />}
      {role === 'parent' && <ParentDashboard stats={data.stats} />}
    </div>
  );
}

export default Dashboard;
