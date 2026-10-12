<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    /**
     * List courses (with optional filters for category, level, search).
     */
    public function index(Request $request)
    {
        $query = Course::with(['category', 'instructor'])
            ->withCount(['enrollments' => fn($q) => $q->where('status', 'active')]);

        // Only admin sees unpublished courses
        if (! $this->viewer($request)?->isAdmin()) {
            $query->where('is_published', true);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        if ($request->filled('search')) {
            $query->where(fn($q) =>
                $q->where('title', 'like', '%'.$request->search.'%')
                  ->orWhere('description', 'like', '%'.$request->search.'%')
            );
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Create a new course (admin only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'category_id'    => 'required|exists:course_categories,id',
            'instructor_id'  => ['required', Rule::exists('users', 'id')->where('role_id', $this->adminRoleId())],
            'level'          => 'required|in:beginner,intermediate,advanced',
            'price'          => 'required|numeric|min:0',
            'duration_hours' => 'nullable|integer|min:1',
            'image'          => 'nullable|string',
            'is_published'   => 'boolean',
            'max_students'   => 'nullable|integer|min:1',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        // Ensure slug is unique
        $slug = $validated['slug'];
        $count = 1;
        while (Course::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $slug.'-'.$count++;
        }

        $course = Course::create($validated);

        return response()->json($course->load(['category', 'instructor']), 201);
    }

    /**
     * Show a single course.
     */
    public function show(Request $request, Course $course)
    {
        $viewer = $this->viewer($request);

        if (! $course->is_published && ! $viewer?->isAdmin()) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $course->load(['category', 'instructor'])
               ->loadCount(['enrollments' => fn($q) => $q->where('status', 'active')]);

        // Include enrollment status when a student is viewing
        if ($viewer?->isStudent()) {
            $course->enrollment = Enrollment::where('student_id', $viewer->id)
                ->where('status', '!=', 'dropped')
                ->where('course_id', $course->id)
                ->first();
        }

        return response()->json($course);
    }

    /**
     * Update a course (admin only).
     */
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title'          => 'sometimes|required|string|max:255',
            'description'    => 'nullable|string',
            'category_id'    => 'sometimes|required|exists:course_categories,id',
            'instructor_id'  => ['sometimes', 'required', Rule::exists('users', 'id')->where('role_id', $this->adminRoleId())],
            'level'          => 'sometimes|required|in:beginner,intermediate,advanced',
            'price'          => 'sometimes|required|numeric|min:0',
            'duration_hours' => 'nullable|integer|min:1',
            'image'          => 'nullable|string',
            'is_published'   => 'boolean',
            'max_students'   => 'nullable|integer|min:1',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $course->title) {
            $base = Str::slug($validated['title']);
            $slug = $base;
            $i = 1;
            while (Course::where('slug', $slug)->where('id', '!=', $course->id)->exists()) {
                $slug = $base.'-'.$i++;
            }
            $validated['slug'] = $slug;
        }

        $course->update($validated);

        return response()->json($course->load(['category', 'instructor']));
    }

    /**
     * Delete a course (admin only).
     */
    public function destroy(Request $request, Course $course)
    {
        $course->delete();

        return response()->json(['message' => 'Course deleted.']);
    }

    /** Resolve the user from an optional bearer token on public routes. */
    private function viewer(Request $request)
    {
        return $request->user('sanctum')?->loadMissing('role');
    }

    private function adminRoleId()
    {
        return Role::where('name', 'admin')->value('id');
    }
}
