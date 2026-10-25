import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryService, courseService } from '../services';
import useFetch from '../hooks/useFetch';
import CourseImage from './CourseImage';
import { Badge, Card, EmptyState, PageLoader, levelColor, statusColor } from './ui';

/**
 * Presentation + data helpers shared by the public catalog and the dashboard catalog.
 * Nothing here knows about roles: each page decides which actions to add around it.
 */

const emptyFilters = { search: '', category_id: '', level: '' };

/** Filters (debounced search), category list and course list. `publicView` ignores the session entirely. */
export function useCourseCatalog({ publicView = false } = {}) {
  const [searchParams] = useSearchParams();
  const cfg = publicView ? { public: true } : {};
  const [filters, setFilters] = useState({ ...emptyFilters, category_id: searchParams.get('category_id') || '' });
  const [debounced, setDebounced] = useState(filters);

  // Debounce so typing does not fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebounced(filters), 300);
    return () => clearTimeout(t);
  }, [filters]);

  const { data: categories } = useFetch(() => categoryService.getAll(cfg), []);
  const { data: courses, loading } = useFetch(() => {
    const params = Object.fromEntries(Object.entries(debounced).filter(([, v]) => v !== ''));
    return courseService.getAll(params, cfg);
  }, [debounced]);

  return { filters, setFilters, clear: () => setFilters(emptyFilters), categories: categories || [], courses, loading };
}

export function CourseFilterBar({ filters, setFilters, clear, categories }) {
  const set = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  return (
    <Card className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <input name="search" className="input" placeholder="Search courses..." value={filters.search} onChange={set} aria-label="Search courses" />
      <select name="category_id" className="input" value={filters.category_id} onChange={set} aria-label="Category">
        <option value="">All categories</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select name="level" className="input" value={filters.level} onChange={set} aria-label="Level">
        <option value="">All levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <button type="button" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={clear}>Clear filters</button>
    </Card>
  );
}

export const formatPrice = (price) => (Number(price) > 0 ? `$${Number(price).toFixed(2)}` : 'Free');

export function CourseCard({ course: c, to }) {
  return (
    <Card className="flex flex-col overflow-hidden !p-0 transition hover:shadow-md">
      <CourseImage course={c} className="h-40 w-full" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900">{c.title}</h3>
          <Badge color={levelColor[c.level]}>{c.level}</Badge>
        </div>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-600">{c.category?.name}</p>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{c.description || 'No description.'}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 text-xs text-slate-500">
          <span>👤 {c.instructor?.name}</span>
          {c.duration_hours && <span>⏱ {c.duration_hours}h</span>}
          <span>🎓 {c.enrollments_count || 0}</span>
          {!c.is_published && <Badge color="amber">Unpublished</Badge>}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">{formatPrice(c.price)}</span>
          <Link to={to} className="text-sm font-medium text-brand-700 hover:underline">View details →</Link>
        </div>
      </div>
    </Card>
  );
}

export function CourseGrid({ courses, loading, linkTo }) {
  if (loading && !courses) return <PageLoader text="Loading courses..." />;
  if (!courses || courses.length === 0) return <EmptyState title="No courses found" text="Try changing your filters." />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => <CourseCard key={c.id} course={c} to={linkTo(c)} />)}
    </div>
  );
}

/** Main information card of a course page. `children` renders extra, page-specific content at the bottom. */
export function CourseOverview({ course, extraBadges, children }) {
  return (
    <Card className="lg:col-span-2">
      <CourseImage course={course} className="-mx-5 -mt-5 mb-5 h-56 w-[calc(100%+2.5rem)] rounded-t-xl sm:h-72" />
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={levelColor[course.level]}>{course.level}</Badge>
        {!course.is_published && <Badge color="amber">Unpublished</Badge>}
        {extraBadges}
      </div>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">{course.title}</h1>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div><dt className="text-slate-500">Category</dt><dd className="font-medium">{course.category?.name}</dd></div>
        <div><dt className="text-slate-500">Instructor</dt><dd className="font-medium">{course.instructor?.name}</dd></div>
        <div><dt className="text-slate-500">Duration</dt><dd className="font-medium">{course.duration_hours ? `${course.duration_hours} hours` : '-'}</dd></div>
        <div><dt className="text-slate-500">Students</dt><dd className="font-medium">{course.enrollments_count || 0}{course.max_students ? ` / ${course.max_students}` : ''}</dd></div>
      </dl>
      <h2 className="mt-6 text-lg font-semibold">About this course</h2>
      <p className="mt-2 whitespace-pre-line text-slate-600">{course.description || 'No description available.'}</p>
      {children}
    </Card>
  );
}

export { statusColor };
