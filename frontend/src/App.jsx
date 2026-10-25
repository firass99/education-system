import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ROLES } from "./config/navigation";
import { GuestOnly, RequireAuth } from "./components/guards";
import PublicLayout from "./components/layouts/PublicLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";
import NotFound from "./pages/NotFound";

// Public (read-only, no role logic)
import Landing from "./pages/public/Landing";
import About from "./pages/public/About";
import PublicCourses from "./pages/public/Courses";
import PublicCourseDetail from "./pages/public/CourseDetail";
import PublicCategories from "./pages/public/Categories";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard (authenticated, role-aware management)
import Overview from "./pages/dashboard/Overview";
import Courses from "./pages/dashboard/Courses";
import CourseDetail from "./pages/dashboard/CourseDetail";
import CourseForm from "./pages/dashboard/CourseForm";
import Categories from "./pages/dashboard/Categories";
import Enrollments from "./pages/dashboard/Enrollments";
import Children from "./pages/dashboard/Children";
import Users from "./pages/dashboard/Users";
import Profile from "./pages/dashboard/Profile";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Marketing pages: full-width sections (the header adapts to the session) */}
          <Route element={<PublicLayout contained={false} />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* Public catalog: read-only for everyone, never shows management actions */}
          <Route element={<PublicLayout />}>
            <Route path="/courses" element={<PublicCourses />} />
            <Route path="/courses/:id" element={<PublicCourseDetail />} />
            <Route path="/categories" element={<PublicCategories />} />
          </Route>

          {/* Guest-only: signed-in users are bounced to /dashboard */}
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Authenticated area: any signed-in user; nested guards narrow it by role (403 otherwise) */}
          <Route path="/dashboard" element={<RequireAuth />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="categories" element={<Categories />} />
              <Route path="profile" element={<Profile />} />

              <Route element={<RequireAuth roles={ROLES.enrollments} />}>
                <Route path="enrollments" element={<Enrollments />} />
              </Route>
              <Route element={<RequireAuth roles={ROLES.parent} />}>
                <Route path="children" element={<Children />} />
              </Route>
              <Route element={<RequireAuth roles={ROLES.admin} />}>
                <Route path="users" element={<Users />} />
                <Route path="courses/create" element={<CourseForm />} />
                <Route path="courses/:id/edit" element={<CourseForm />} />
              </Route>
              <Route path="*" element={<NotFound home="/dashboard" />} />
            </Route>
          </Route>

          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
