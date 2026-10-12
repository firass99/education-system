<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role): User
    {
        $r = Role::firstOrCreate(['name' => $role], ['description' => $role]);

        return User::create([
            'name' => ucfirst($role), 'email' => $role.'@test.com',
            'password' => 'password', 'role_id' => $r->id,
        ]);
    }

    private function course(User $admin, array $over = []): Course
    {
        $cat = CourseCategory::firstOrCreate(['slug' => 'cat'], ['name' => 'Cat', 'is_active' => true]);

        return Course::create(array_merge([
            'title' => 'Course', 'slug' => 'course', 'category_id' => $cat->id,
            'instructor_id' => $admin->id, 'level' => 'beginner', 'price' => 0, 'is_published' => true,
        ], $over));
    }

    public function test_register_cannot_choose_admin_role(): void
    {
        Role::create(['name' => 'admin']);
        $this->postJson('/api/auth/register', [
            'name' => 'X', 'email' => 'x@test.com', 'password' => 'password12',
            'password_confirmation' => 'password12', 'role' => 'admin',
        ])->assertStatus(422);
    }

    public function test_register_student_and_login(): void
    {
        Role::create(['name' => 'student']);
        $this->postJson('/api/auth/register', [
            'name' => 'X', 'email' => 'x@test.com', 'password' => 'password12',
            'password_confirmation' => 'password12', 'role' => 'student',
        ])->assertCreated()->assertJsonPath('user.role.name', 'student');

        $this->postJson('/api/auth/login', ['email' => 'x@test.com', 'password' => 'password12'])
            ->assertOk()->assertJsonStructure(['token']);
    }

    public function test_non_admin_cannot_manage_users_or_courses(): void
    {
        $this->user('admin');
        Sanctum::actingAs($this->user('student'));

        $this->getJson('/api/users')->assertForbidden();
        $this->postJson('/api/courses', [])->assertForbidden();
        $this->postJson('/api/categories', [])->assertForbidden();
    }

    public function test_unauthenticated_gets_401(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    public function test_admin_can_create_course_with_unique_slug(): void
    {
        $admin = $this->user('admin');
        $cat = CourseCategory::create(['name' => 'C', 'slug' => 'c']);
        Sanctum::actingAs($admin);

        $payload = ['title' => 'Same', 'category_id' => $cat->id, 'instructor_id' => $admin->id,
            'level' => 'beginner', 'price' => 10];
        $this->postJson('/api/courses', $payload)->assertCreated()->assertJsonPath('slug', 'same');
        $this->postJson('/api/courses', $payload)->assertCreated()->assertJsonPath('slug', 'same-1');
    }

    public function test_enroll_drop_and_reenroll(): void
    {
        $course = $this->course($this->user('admin'));
        $student = $this->user('student');
        Sanctum::actingAs($student);

        $id = $this->postJson('/api/enrollments', ['course_id' => $course->id, 'student_id' => null])
            ->assertCreated()->json('id');
        $this->postJson('/api/enrollments', ['course_id' => $course->id])->assertStatus(422);

        $this->deleteJson("/api/enrollments/$id")->assertOk();
        $this->postJson('/api/enrollments', ['course_id' => $course->id])->assertCreated();
    }

    public function test_student_cannot_edit_own_grade(): void
    {
        $course = $this->course($this->user('admin'));
        $student = $this->user('student');
        Sanctum::actingAs($student);

        $id = $this->postJson('/api/enrollments', ['course_id' => $course->id])->json('id');
        $this->putJson("/api/enrollments/$id", ['grade' => 100])->assertForbidden();
    }

    public function test_course_show_includes_enrollment_for_authenticated_student(): void
    {
        $course = $this->course($this->user('admin'));
        $student = $this->user('student');
        Sanctum::actingAs($student);
        $this->postJson('/api/enrollments', ['course_id' => $course->id])->assertCreated();

        $this->getJson("/api/courses/{$course->id}")->assertOk()->assertJsonPath('enrollment.student_id', $student->id);
    }
}
