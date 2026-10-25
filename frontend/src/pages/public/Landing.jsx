import React from 'react';
import { Link } from 'react-router-dom';
import { courseService, categoryService } from '../../services';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/icons';
import CourseImage from '../../components/CourseImage';
import { Badge, Card, LinkButton, Skeleton, levelColor } from '../../components/ui';

const features = [
  { icon: 'book', title: 'Rich course catalog', text: 'Browse courses by category and level, with clear descriptions, durations and instructors.' },
  { icon: 'chart', title: 'Live progress tracking', text: 'Students see progress and grades per course; every update is reflected instantly.' },
  { icon: 'users', title: 'Built for families', text: 'Parents link their children and follow enrollments, progress and results in one view.' },
  { icon: 'shield', title: 'Role-based access', text: 'Students, parents and administrators each get exactly the tools they need — nothing more.' },
  { icon: 'list', title: 'Simple enrollment', text: 'Enroll in a click, drop when plans change, and keep a complete history.' },
  { icon: 'sparkles', title: 'Admin insights', text: 'Dashboards with charts surface popular courses, enrollment trends and platform health.' },
];

const steps = [
  { n: '1', title: 'Create your account', text: 'Sign up as a student or parent in under a minute.' },
  { n: '2', title: 'Pick your courses', text: 'Explore the catalog and enroll in what fits your goals.' },
  { n: '3', title: 'Track your growth', text: 'Follow progress and grades from your personal dashboard.' },
];

const roles = [
  { name: 'Students', icon: 'cap', items: ['Enroll in courses', 'Track progress & grades', 'Personal dashboard'] },
  { name: 'Parents', icon: 'users', items: ['Link your children', 'See their courses', 'Monitor results'] },
  { name: 'Administrators', icon: 'shield', items: ['Manage courses & categories', 'Manage users & roles', 'Analytics dashboard'] },
];

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Landing() {
  const { isAuthenticated } = useAuth();
  const { data: courses, loading: loadingCourses } = useFetch(() => courseService.getAll({}, { public: true }), []);
  const { data: categories } = useFetch(() => categoryService.getAll({ public: true }), []);

  const published = (courses || []).filter((c) => c.is_published !== false);
  const featured = [...published].sort((a, b) => (b.enrollments_count || 0) - (a.enrollments_count || 0)).slice(0, 3);
  const learners = published.reduce((s, c) => s + (c.enrollments_count || 0), 0);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700">
            <Icon name="sparkles" className="h-4 w-4" /> Education management, simplified
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Learn, track and grow — <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">all in one place</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            EduSystem connects students, parents and administrators with a clean course catalog, effortless enrollment and clear progress insights.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton to={isAuthenticated ? '/dashboard' : '/register'} className="px-6 py-3 text-base">
              {isAuthenticated ? 'Go to dashboard' : 'Get started free'} <Icon name="arrow" className="h-4 w-4" />
            </LinkButton>
            <LinkButton to="/courses" variant="secondary" className="px-6 py-3 text-base">Browse courses</LinkButton>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <Stat value={courses ? published.length : '—'} label="Courses" />
            <Stat value={categories ? categories.length : '—'} label="Categories" />
            <Stat value={courses ? learners : '—'} label="Enrollments" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Everything you need to run learning</h2>
          <p className="mt-3 text-slate-600">Thoughtful tools for every role, without the clutter.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon name={f.icon} className="h-6 w-6" /></span>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Popular courses</h2>
              <p className="mt-2 text-slate-600">What learners are enrolling in right now.</p>
            </div>
            <Link to="/courses" className="hidden text-sm font-medium text-brand-700 hover:underline sm:block">View all →</Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {loadingCourses && !courses && [0, 1, 2].map((i) => <Skeleton key={i} className="h-52" />)}
            {featured.map((c) => (
              <Link key={c.id} to={`/courses/${c.id}`} className="group">
                <Card className="h-full overflow-hidden !p-0 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <CourseImage course={c} className="h-40 w-full" />
                  <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{c.category?.name}</p>
                    <Badge color={levelColor[c.level]}>{c.level}</Badge>
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-900">{c.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">{c.description || 'No description.'}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-500">{c.instructor?.name}</span>
                    <span className="font-bold text-slate-900">{Number(c.price) > 0 ? `$${Number(c.price).toFixed(2)}` : 'Free'}</span>
                  </div>
                  </div>
                </Card>
              </Link>
            ))}
            {courses && featured.length === 0 && <p className="col-span-full text-center text-slate-500">Courses will appear here soon.</p>}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold text-slate-900">Explore by category</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categories.filter((c) => c.is_active !== false).map((c) => (
              <Link key={c.id} to={`/courses?category_id=${c.id}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700">
                {c.name} <span className="ml-1 text-slate-400">{c.courses_count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold">{s.n}</span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">One platform, three roles</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {roles.map((r) => (
            <Card key={r.name}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon name={r.icon} className="h-6 w-6" /></span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{r.name}</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {r.items.map((i) => <li key={i} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-emerald-600" /> {i}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-brand-600 to-violet-700 px-6 py-14 text-center text-white shadow-lg">
          <h2 className="text-3xl font-bold">{isAuthenticated ? 'Pick up where you left off' : 'Ready to start learning?'}</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">{isAuthenticated ? 'Your courses and progress are waiting in your dashboard.' : 'Create a free account and enroll in your first course today.'}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton to={isAuthenticated ? '/dashboard' : '/register'} className="!bg-white px-6 py-3 text-base !text-brand-700 hover:!bg-brand-50">
              {isAuthenticated ? 'Go to dashboard' : 'Create account'}
            </LinkButton>
            {!isAuthenticated && (
              <LinkButton to="/login" className="border border-white/40 !bg-transparent px-6 py-3 text-base hover:!bg-white/10">Sign in</LinkButton>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Landing;
