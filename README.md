# Education System - Laravel + React

A complete education management system with role-based access control (Admin, Student, Parent), course management, and enrollment tracking.

## Features

### User Roles
- **Admin**: Full system access, manage users, courses, categories, view all statistics
- **Student**: Browse and enroll in courses, track progress, view grades
- **Parent**: Monitor children's progress and enrollments

### Core Functionality
- **Authentication**: Token-based authentication with Laravel Sanctum (bearer tokens, 7-day expiry)
- **Course Management**: Create, edit, delete courses with categories and levels
- **Course Categories**: Organize courses by subject areas
- **Enrollments**: Student enrollment system with progress tracking
- **Dashboard**: Role-specific dashboards with relevant statistics
- **Progress Tracking**: Real-time progress updates and grade management

## Technology Stack

### Backend
- **Framework**: Laravel 13.x
- **Database**: SQLite
- **Authentication**: Laravel Sanctum
- **API**: RESTful API architecture

### Frontend
- **Framework**: React 19.x
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: Context API

## Installation

### Prerequisites
- PHP 8.4+ with SQLite extension enabled
- Composer
- Node.js 16+ and npm
- Git (optional)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd education-system/backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. The SQLite database is already created and migrated with seed data

4. Start the Laravel development server:
```bash
php artisan serve
```

The backend API will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd education-system/frontend
```

2. Install npm dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Demo Accounts

The system comes pre-seeded with the following test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | password |
| Student | student@school.com | password |
| Parent | parent@school.com | password |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (authenticated)
- `GET /api/auth/me` - Get current user profile (authenticated)
- `PUT /api/auth/profile` - Update profile (authenticated)
- `GET /api/auth/roles` - Get all roles

### Courses
- `GET /api/courses` - List all courses (with filters)
- `GET /api/courses/{id}` - Get course details
- `POST /api/courses` - Create course (admin only)
- `PUT /api/courses/{id}` - Update course (admin only)
- `DELETE /api/courses/{id}` - Delete course (admin only)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/{id}` - Get category details
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/{id}` - Update category (admin only)
- `DELETE /api/categories/{id}` - Delete category (admin only)

### Enrollments
- `GET /api/enrollments` - List enrollments (role-based)
- `POST /api/enrollments` - Enroll in a course
- `PUT /api/enrollments/{id}` - Update enrollment progress
- `DELETE /api/enrollments/{id}` - Drop enrollment

### Dashboard
- `GET /api/dashboard` - Get role-specific dashboard statistics

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Database Schema

### Tables
- **users** - User accounts with role and profile information
- **roles** - User roles (admin, student, parent)
- **course_categories** - Course categories
- **courses** - Course information
- **enrollments** - Student enrollments with progress tracking

### Relationships
- User belongs to Role
- User can have Parent (self-referencing)
- Course belongs to Category
- Course belongs to Instructor (User)
- Enrollment links Student (User) to Course

## Project Structure

### Backend
```
backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── CourseController.php
│   │   ├── CourseCategoryController.php
│   │   ├── EnrollmentController.php
│   │   ├── DashboardController.php
│   │   └── UserController.php
│   └── Models/
│       ├── User.php
│       ├── Role.php
│       ├── Course.php
│       ├── CourseCategory.php
│       └── Enrollment.php
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/
    └── api.php
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Navbar.js
│   │   ├── Dashboard.js
│   │   ├── Courses.js
│   │   ├── CourseDetail.js
│   │   └── PrivateRoute.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── services/
│   │   ├── api.js
│   │   └── index.js
│   ├── App.js
│   └── App.css
```

## Features by Role

### Admin Dashboard
- Total students, parents, courses statistics
- Recent enrollments
- Popular courses
- Full CRUD operations on users, courses, and categories

### Student Dashboard
- Enrolled courses count
- Completed courses
- In-progress courses
- Average progress and grades
- Course enrollment management

### Parent Dashboard
- Children's progress overview
- Enrolled courses by child
- Average grades and completion rates

## Development

### Running Migrations
```bash
cd backend
php artisan migrate:fresh --seed
```

### Clearing Cache
```bash
php artisan config:clear
php artisan cache:clear
```

### Building for Production

Backend:
```bash
php artisan config:cache
php artisan route:cache
```

Frontend:
```bash
npm run build
```

## Security Features

- Password hashing with bcrypt
- Sanctum bearer-token authentication, role middleware (`role:admin`)
- CORS protection
- Role-based access control
- SQL injection protection (Eloquent ORM)
- XSS protection

## License

This project is open-source and available for educational purposes.

## Support

For issues or questions, please check the documentation or contact the development team.

---

**Created**: October 2026  
**Version**: 1.0.0
