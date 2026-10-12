<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\Enrollment;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create roles
        $adminRole   = Role::create(['name' => 'admin',   'description' => 'System administrator']);
        $studentRole = Role::create(['name' => 'student', 'description' => 'Enrolled student']);
        $parentRole  = Role::create(['name' => 'parent',  'description' => 'Parent / guardian']);

        // Create admin user
        $admin = User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@school.com',
            'password' => Hash::make('password'),
            'role_id'  => $adminRole->id,
        ]);

        // Create parent user
        $parent = User::create([
            'name'     => 'Parent User',
            'email'    => 'parent@school.com',
            'password' => Hash::make('password'),
            'role_id'  => $parentRole->id,
            'phone'    => '+1-555-0100',
        ]);

        // Create student user linked to parent
        $student = User::create([
            'name'          => 'Student User',
            'email'         => 'student@school.com',
            'password'      => Hash::make('password'),
            'role_id'       => $studentRole->id,
            'parent_id'     => $parent->id,
            'date_of_birth' => '2006-05-15',
        ]);

        // Create a second student for variety
        $student2 = User::create([
            'name'          => 'Jane Smith',
            'email'         => 'jane@school.com',
            'password'      => Hash::make('password'),
            'role_id'       => $studentRole->id,
            'parent_id'     => $parent->id,
            'date_of_birth' => '2007-09-20',
        ]);

        // Course categories
        $categories = [
            ['name' => 'Mathematics',        'description' => 'Algebra, Geometry, Calculus and more'],
            ['name' => 'Science',            'description' => 'Physics, Chemistry, Biology'],
            ['name' => 'Languages',          'description' => 'English, French, Arabic and foreign languages'],
            ['name' => 'Computer Science',   'description' => 'Programming, Web Dev, AI'],
            ['name' => 'Arts & Music',       'description' => 'Visual arts, instruments, music theory'],
            ['name' => 'Social Studies',     'description' => 'History, Geography, Civics'],
        ];

        $createdCategories = [];
        foreach ($categories as $cat) {
            $createdCategories[] = CourseCategory::create([
                'name'        => $cat['name'],
                'description' => $cat['description'],
                'slug'        => Str::slug($cat['name']),
                'is_active'   => true,
            ]);
        }

        // Courses
        $courses = [
            ['title' => 'Algebra Fundamentals',     'category' => 0, 'level' => 'beginner',     'price' => 0,     'duration' => 40],
            ['title' => 'Advanced Calculus',         'category' => 0, 'level' => 'advanced',     'price' => 49.99, 'duration' => 60],
            ['title' => 'Introduction to Physics',   'category' => 1, 'level' => 'beginner',     'price' => 0,     'duration' => 35],
            ['title' => 'Chemistry Basics',          'category' => 1, 'level' => 'beginner',     'price' => 29.99, 'duration' => 30],
            ['title' => 'English Grammar & Writing', 'category' => 2, 'level' => 'intermediate', 'price' => 0,     'duration' => 25],
            ['title' => 'Python Programming',        'category' => 3, 'level' => 'beginner',     'price' => 59.99, 'duration' => 50],
            ['title' => 'Web Development Bootcamp',  'category' => 3, 'level' => 'intermediate', 'price' => 79.99, 'duration' => 80],
            ['title' => 'Drawing & Painting',        'category' => 4, 'level' => 'beginner',     'price' => 19.99, 'duration' => 20],
            ['title' => 'World History',             'category' => 5, 'level' => 'intermediate', 'price' => 0,     'duration' => 45],
        ];

        $createdCourses = [];
        foreach ($courses as $course) {
            $createdCourses[] = Course::create([
                'title'          => $course['title'],
                'slug'           => Str::slug($course['title']),
                'description'    => "A comprehensive course on {$course['title']}.",
                'category_id'    => $createdCategories[$course['category']]->id,
                'instructor_id'  => $admin->id,
                'level'          => $course['level'],
                'price'          => $course['price'],
                'duration_hours' => $course['duration'],
                'image'          => 'https://picsum.photos/seed/'.Str::slug($course['title']).'/800/450',
                'is_published'   => true,
                'max_students'   => 30,
            ]);
        }

        // Enroll student in a few courses
        Enrollment::create([
            'student_id'  => $student->id,
            'course_id'   => $createdCourses[0]->id,
            'status'      => 'active',
            'progress'    => 65,
            'enrolled_at' => now()->subDays(20),
        ]);

        Enrollment::create([
            'student_id'  => $student->id,
            'course_id'   => $createdCourses[4]->id,
            'status'      => 'completed',
            'progress'    => 100,
            'grade'       => 92.5,
            'enrolled_at' => now()->subDays(60),
            'completed_at' => now()->subDays(5),
        ]);

        Enrollment::create([
            'student_id'  => $student2->id,
            'course_id'   => $createdCourses[5]->id,
            'status'      => 'active',
            'progress'    => 30,
            'enrolled_at' => now()->subDays(10),
        ]);
    }
}
