/** Role groups shared by the sidebar and the route guards in App.jsx so the two cannot drift apart. */
export const ROLES = {
  admin: ['admin'],
  parent: ['parent'],
  enrollments: ['admin', 'student', 'parent'],
};

/** Single source of truth for role-aware navigation. `roles` omitted = every authenticated user. */
export const dashboardNav = [
  {
    heading: 'Main',
    items: [
      { to: '/dashboard', label: 'Overview', icon: 'squares', end: true },
      { to: '/dashboard/courses', label: 'Courses', icon: 'book' },
      { to: '/dashboard/categories', label: 'Categories', icon: 'tag' },
      { to: '/dashboard/enrollments', label: 'Enrollments', icon: 'list', roles: ROLES.enrollments },
      { to: '/dashboard/children', label: 'My children', icon: 'users', roles: ROLES.parent },
    ],
  },
  {
    heading: 'Administration',
    roles: ROLES.admin,
    items: [
      { to: '/dashboard/users', label: 'Users', icon: 'users', roles: ROLES.admin },
    ],
  },
  {
    heading: 'Account',
    items: [
      { to: '/dashboard/profile', label: 'Profile', icon: 'user' },
    ],
  },
];

export const publicNav = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses', label: 'Courses' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
];

export const canSee = (entry, role) => !entry.roles || entry.roles.includes(role);

export const navForRole = (role) =>
  dashboardNav
    .filter((g) => canSee(g, role))
    .map((g) => ({ ...g, items: g.items.filter((i) => canSee(i, role)) }))
    .filter((g) => g.items.length);
