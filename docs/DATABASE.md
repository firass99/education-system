# Database Architecture

The Education System uses **SQLite** with Laravel Eloquent ORM. Below is the complete schema design and relationship mapping.

## ER Diagram Structure

```
+-------------------+       +-------------------+
|       roles       |       | course_categories |
+-------------------+       +-------------------+
| id (PK)           |       | id (PK)           |
| name              |       | name              |
| description       |       | slug              |
+-------------------+       | is_active         |
          |                 +-------------------+
          |                           |
          v                           v
+-------------------+       +-------------------+
|       users       |       |      courses      |
+-------------------+       +-------------------+
| id (PK)           |       | id (PK)           |
| name              |       | title             |
| email             |       | slug              |
| password          |       | description       |
| role_id (FK)      |<----->| category_id (FK)  |
| parent_id (FK)    |       | instructor_id (FK)|
| phone             |       | level             |
| address           |       | price             |
| date_of_birth     |       | duration_hours    |
+-------------------+       | max_students      |
          |                 | is_published      |
          |                 +-------------------+
          |                           |
          +-------------+             |
                        |             |
                        v             v
                    +---------------------+
                    |     enrollments     |
                    +---------------------+
                    | id (PK)             |
                    | student_id (FK)     |
                    | course_id (FK)      |
                    | status              |
                    | progress            |
                    | grade               |
                    | enrolled_at         |
                    | completed_at        |
                    +---------------------+
```

---

## Table Definitions

### 1. `roles`
Stores user permission roles (`admin`, `student`, `parent`).
- `id`: Primary Key
- `name`: String (Unique)
- `description`: Text (Nullable)
- `timestamps`: created_at, updated_at

### 2. `users`
Stores user accounts for admins, students, and parents.
- `id`: Primary Key
- `name`: String
- `email`: String (Unique)
- `password`: Hashed String
- `role_id`: Foreign Key referencing `roles(id)` (Nullable, Set Null on Delete)
- `parent_id`: Self-referencing Foreign Key referencing `users(id)` for student-parent relationship (Nullable)
- `phone`: String (Nullable)
- `address`: Text (Nullable)
- `date_of_birth`: Date (Nullable)
- `timestamps`: created_at, updated_at

### 3. `course_categories`
Organizes courses into subject areas (e.g. Mathematics, Science).
- `id`: Primary Key
- `name`: String
- `slug`: String (Unique)
- `description`: Text (Nullable)
- `is_active`: Boolean (Default: true)
- `timestamps`: created_at, updated_at

### 4. `courses`
Stores course information.
- `id`: Primary Key
- `title`: String
- `slug`: String (Unique)
- `description`: Text (Nullable)
- `category_id`: Foreign Key referencing `course_categories(id)` (Cascade on Delete)
- `instructor_id`: Foreign Key referencing `users(id)` (Cascade on Delete)
- `level`: String (`beginner`, `intermediate`, `advanced`)
- `price`: Decimal (8,2) (Default: 0.00)
- `duration_hours`: Integer (Nullable)
- `image`: String (Nullable)
- `is_published`: Boolean (Default: false)
- `max_students`: Integer (Nullable)
- `timestamps`: created_at, updated_at

### 5. `enrollments`
Tracks student enrollments in courses, including progress and grades.
- `id`: Primary Key
- `student_id`: Foreign Key referencing `users(id)` (Cascade on Delete)
- `course_id`: Foreign Key referencing `courses(id)` (Cascade on Delete)
- `status`: String (`active`, `completed`, `dropped`)
- `progress`: Integer (0-100, Default: 0)
- `grade`: Decimal (5,2) (Nullable)
- `enrolled_at`: Timestamp
- `completed_at`: Timestamp (Nullable)
- `timestamps`: created_at, updated_at
- **Constraint**: Unique combination of `student_id` and `course_id`.

---

## Eloquent Models & Relationships

- **Role**: `hasMany(User)`
- **User**: 
  - `belongsTo(Role)`
  - `belongsTo(User, 'parent_id')` (Parent)
  - `hasMany(User, 'parent_id')` (Children)
  - `hasMany(Enrollment, 'student_id')`
  - `belongsToMany(Course, 'enrollments')`
- **CourseCategory**: `hasMany(Course)`
- **Course**:
  - `belongsTo(CourseCategory)`
  - `belongsTo(User, 'instructor_id')`
  - `hasMany(Enrollment)`
  - `belongsToMany(User, 'enrollments')`
- **Enrollment**:
  - `belongsTo(User, 'student_id')`
  - `belongsTo(Course)`
