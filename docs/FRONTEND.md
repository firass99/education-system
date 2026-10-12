# Frontend Architecture

The frontend is built with **React 19**, **React Router DOM v7**, and **Axios**, styled with **Tailwind CSS 3** and **react-hot-toast** for notifications.

## Directory Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
└── src/
    ├── components/
    │   ├── Auth.css
    │   ├── CourseDetail.css
    │   ├── CourseDetail.js
    │   ├── Courses.css
    │   ├── Courses.js
    │   ├── Dashboard.css
    │   ├── Dashboard.js
    │   ├── Login.js
    │   ├── Navbar.css
    │   ├── Navbar.js
    │   ├── PrivateRoute.js
    │   └── Register.js
    ├── context/
    │   └── AuthContext.js
    ├── services/
    │   ├── api.js
    │   └── index.js
    ├── App.css
    ├── App.js
    ├── index.js
    └── reportWebVitals.js
```

---

## Key Modules & Components

### 1. Services (`src/services/`)
- **`api.js`**: Configured Axios instance with base URL `http://127.0.0.1:8000/api`, automatic Bearer token injection from `localStorage`, and 401 unauthorized interceptor redirection to login.
- **`index.js`**: API service modules (`authService`, `courseService`, `categoryService`, `enrollmentService`, `dashboardService`, `userService`).

### 2. Context (`src/context/`)
- **`AuthContext.js`**: Provides global authentication state (`user`, `loading`, `login`, `register`, `logout`, helper methods `isAdmin()`, `isStudent()`, `isParent()`).

### 3. Components (`src/components/`)
- **`PrivateRoute.js`**: Protects routes requiring authentication and enforces optional role restrictions (`requiredRole`).
- **`Navbar.js`**: Top navigation bar with dynamic links based on user role and auth status.
- **`Login.js`**: User login form with demo account hints.
- **`Register.js`**: Account registration form supporting role selection and parent-student linking.
- **`Dashboard.js`**: Role-adaptive dashboard rendering admin statistics, student course progress, or parent child monitoring.
- **`Courses.js`**: Course catalog with search, category filtering, and level filtering.
- **`CourseDetail.js`**: Individual course page with enrollment actions, progress tracking, and admin controls.

---

## Routing Table

| Path | Component | Access | Description |
|---|---|---|---|
| `/` | Redirect | Public | Redirects to `/courses` |
| `/login` | Login | Public | Login page |
| `/register` | Register | Public | Registration page |
| `/courses` | Courses | Public | Browse and filter courses |
| `/courses/:id` | CourseDetail | Public / Auth | View course details & enroll |
| `/dashboard` | Dashboard | Authenticated | Role-specific dashboard |
| `/enrollments` | Enrollments | Student / Admin | View student enrollments |
| `/categories` | Categories | Public | Browse course categories |
| `/profile` | Profile | Authenticated | User profile management |
| `/admin/users` | Users | Admin | User management |
| `/parent/children` | Children | Parent | Children's progress view |
