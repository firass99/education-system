# API Documentation

Base URL: `http://127.0.0.1:8000/api`

## Authentication

### Register
- **Endpoint**: `POST /auth/register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role_id": 2,
    "phone": "+15550199",
    "address": "123 Main St",
    "date_of_birth": "2005-01-01"
  }
  ```
- **Response**: `201 Created` with user object and bearer token.

### Login
- **Endpoint**: `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "admin@school.com",
    "password": "password"
  }
  ```
- **Response**: `200 OK` with user object and bearer token.

### Logout
- **Endpoint**: `POST /auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

### Get Current User Profile
- **Endpoint**: `GET /auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` with user details including role, parent, and children.

### Get Available Roles
- **Endpoint**: `GET /auth/roles`
- **Response**: `200 OK` with list of roles.

---

## Courses

### List Courses
- **Endpoint**: `GET /courses`
- **Query Parameters**:
  - `category_id`: Filter by category ID
  - `level`: Filter by level (`beginner`, `intermediate`, `advanced`)
  - `search`: Search term for title or description
- **Response**: `200 OK` with list of courses.

### Get Course Details
- **Endpoint**: `GET /courses/{id}`
- **Response**: `200 OK` with course details, category, instructor, and student enrollment status (if authenticated student).

### Create Course (Admin)
- **Endpoint**: `POST /courses`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "title": "Advanced Physics",
    "description": "Quantum mechanics and relativity",
    "category_id": 2,
    "instructor_id": 1,
    "level": "advanced",
    "price": 49.99,
    "duration_hours": 45,
    "is_published": true,
    "max_students": 25
  }
  ```

### Update Course (Admin)
- **Endpoint**: `PUT /courses/{id}`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Same as create (fields optional).

### Delete Course (Admin)
- **Endpoint**: `DELETE /courses/{id}`
- **Headers**: `Authorization: Bearer <token>`

---

## Course Categories

### List Categories
- **Endpoint**: `GET /categories`
- **Response**: `200 OK` with list of categories and course counts.

### Get Category Details
- **Endpoint**: `GET /categories/{id}`
- **Response**: `200 OK` with category and its courses.

### Create Category (Admin)
- **Endpoint**: `POST /categories`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Robotics",
    "description": "Building and programming robots",
    "is_active": true
  }
  ```

---

## Enrollments

### List Enrollments
- **Endpoint**: `GET /enrollments`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Role-filtered list of enrollments (Admin sees all, Student sees own, Parent sees children's).

### Enroll in Course
- **Endpoint**: `POST /enrollments`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "course_id": 1,
    "student_id": 2 // Optional for admin enrolling someone else
  }
  ```

### Update Enrollment (Progress / Grade)
- **Endpoint**: `PUT /enrollments/{id}`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "progress": 75,
    "status": "active",
    "grade": 90.00
  }
  ```

### Drop Enrollment
- **Endpoint**: `DELETE /enrollments/{id}`
- **Headers**: `Authorization: Bearer <token>`

---

## Dashboard

### Get Dashboard Statistics
- **Endpoint**: `GET /dashboard`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Role-specific statistics (Admin system stats, Student personal stats, Parent children stats).

---

## Updates (latest)

**Error format** – all errors are JSON: `{ "message": "...", "errors": { "field": ["..."] } }` (`errors` only on 422). Status codes: 401 unauthenticated, 403 forbidden, 404 not found, 422 validation.

**Auth**
- `POST /auth/register` now takes `role` (`student` | `parent`) instead of `role_id`; admin accounts can only be created by an admin via `POST /users`. `parent_id` must reference a parent user.
- `GET /auth/roles` returns only `student` and `parent`. `GET /auth/parents` returns `[{id, name}]` for the registration form.
- `PUT /auth/profile` updates name, phone, address, date_of_birth and (optionally) password (+ `password_confirmation`).
- Tokens expire after `SANCTUM_EXPIRATION` minutes (default 7 days).

**Courses** – `GET /courses` and `GET /courses/{id}` accept an optional bearer token: admins also see unpublished courses and students get their `enrollment` on the course.

**Categories** – `PUT /categories/{id}` and `DELETE /categories/{id}` (admin). Admins also see inactive categories in `GET /categories`.

**Users (admin)** – `GET/POST /users`, `DELETE /users/{id}`; `GET/PUT /users/{id}` also for the user themselves. Admins cannot delete or change the role of their own account.

**Enrollments** – dropped enrollments can be re-activated by enrolling again. Only admins may change `progress`, `grade` and `status`; students can drop their own enrollments; parents have read-only access.

**Dashboard** – admin stats now include `active_enrollments` and `completed_enrollments`.
