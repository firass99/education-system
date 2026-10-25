import React from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services';
import useFetch from '../../hooks/useFetch';
import { Card, EmptyState, PageHeader, PageLoader } from '../../components/ui';

/** Public, read-only category list. Create/edit/delete lives in pages/dashboard. */
function Categories() {
  const { data, loading } = useFetch(() => categoryService.getAll({ public: true }), []);

  if (loading && !data) return <PageLoader />;
  const categories = (data || []).filter((c) => c.is_active !== false);

  return (
    <div>
      <PageHeader title="Categories" subtitle="Browse courses by topic" />
      {categories.length === 0 ? <EmptyState title="No categories yet" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} to={`/courses?category_id=${c.id}`} className="group">
              <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                <h3 className="font-semibold text-slate-900">{c.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{c.description || 'No description.'}</p>
                <p className="mt-4 text-sm font-medium text-brand-700 group-hover:underline">{c.courses_count} courses →</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Categories;
