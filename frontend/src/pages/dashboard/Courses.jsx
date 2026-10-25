import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CourseFilterBar, CourseGrid, useCourseCatalog } from '../../components/catalog';
import Icon from '../../components/icons';
import { LinkButton, PageHeader } from '../../components/ui';

/** Dashboard catalog: same data as the public one, plus admin management actions. */
function Courses() {
  const { isAdmin } = useAuth();
  const catalog = useCourseCatalog();
  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle={isAdmin() ? 'Manage the course catalog' : 'Find the right course for you'}
        actions={isAdmin() && <LinkButton to="/dashboard/courses/create"><Icon name="plus" className="h-4 w-4" /> New course</LinkButton>}
      />
      <CourseFilterBar {...catalog} />
      <CourseGrid courses={catalog.courses} loading={catalog.loading} linkTo={(c) => `/dashboard/courses/${c.id}`} />
    </div>
  );
}

export default Courses;
