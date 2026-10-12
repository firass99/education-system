# Quick Start Guide - Education System

## ✅ System Status

Both servers are currently running:

- **Backend API**: http://127.0.0.1:8000
- **Frontend App**: http://localhost:3000

## 🚀 Quick Access

### Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@school.com | password |
| **Student** | student@school.com | password |
| **Parent** | parent@school.com | password |

## 📝 What to Try First

### As Admin (admin@school.com)
1. Login at http://localhost:3000/login
2. View the admin dashboard with system statistics
3. Browse courses at /courses
4. Manage users (link in navbar)
5. Create new courses
6. View all enrollments

### As Student (student@school.com)
1. Login at http://localhost:3000/login
2. View your enrolled courses and progress
3. Browse available courses
4. Enroll in new courses
5. Track your progress and grades

### As Parent (parent@school.com)
1. Login at http://localhost:3000/login
2. View your children's progress
3. Monitor their enrollments and grades
4. See completion statistics

## 🗂️ Pre-loaded Data

The system comes with:
- **3 Roles**: Admin, Student, Parent
- **4 Users**: 1 Admin, 2 Students, 1 Parent (linked)
- **6 Categories**: Mathematics, Science, Languages, Computer Science, Arts & Music, Social Studies
- **9 Courses**: Various courses across all categories
- **3 Enrollments**: Sample enrollments with different statuses

## 📱 Key Features to Explore

### Course Management
- Search and filter courses by category, level, or keyword
- View detailed course information
- Enroll in courses (as student)
- Track progress with visual progress bars

### Dashboard
- Role-specific statistics and widgets
- Recent activity
- Popular courses
- Progress tracking

### User Management (Admin)
- Create new users with any role
- Link students to parents
- View user details and enrollments

## 🔧 Stopping the Servers

If you need to stop the servers:
- Press `Ctrl+C` in the terminal running the servers
- Or use the task manager to stop the processes

## 🐛 Troubleshooting

### If the frontend doesn't load:
1. Check that http://localhost:3000 opens in your browser
2. Verify the React server is running (check the terminal)

### If API calls fail:
1. Verify the Laravel server is running at http://127.0.0.1:8000
2. Check the browser console for CORS errors
3. Make sure SQLite extensions are enabled in PHP

### Database Issues:
```bash
cd backend
php artisan migrate:fresh --seed
```

## 📚 Next Steps

1. Explore the different role dashboards
2. Create new courses as admin
3. Enroll in courses as a student
4. Monitor progress as a parent
5. Customize the system to your needs

## 🔗 Useful URLs

- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000/api
- Login Page: http://localhost:3000/login
- Courses: http://localhost:3000/courses
- Dashboard: http://localhost:3000/dashboard

---

Enjoy using the Education System! 🎓
