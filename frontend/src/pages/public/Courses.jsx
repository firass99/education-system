import React from 'react';
import { CourseFilterBar, CourseGrid, useCourseCatalog } from '../../components/catalog';
import { PageHeader } from '../../components/ui';

/** Public, read-only course catalog. Management lives in pages/dashboard. */
function Courses() {
  const catalog = useCourseCatalog({ publicView: true });
  return (
    <div>
      <PageHeader title="Courses" subtitle="Find the right course for you" />
      <CourseFilterBar {...catalog} />
      <CourseGrid courses={catalog.courses} loading={catalog.loading} linkTo={(c) => `/courses/${c.id}`} />
    </div>
  );
}

export default Courses;
