<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * List all enrollments (admin sees all; student sees own; parent sees children's).
     */
    public function index(Request $request)
    {
        $user = $request->user()->load('role');

        $query = Enrollment::with(['student', 'course.category']);

        if ($user->isAdmin()) {
            // Admin sees everything
        } elseif ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } elseif ($user->isParent()) {
            $childIds = $user->children()->pluck('id');
            $query->whereIn('student_id', $childIds);
        } else {
            abort(403);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * Enroll a student in a course.
     */
    public function store(Request $request)
    {
        $user = $request->user()->loadMissing('role');

        $validated = $request->validate([
            'course_id'  => 'required|exists:courses,id',
            'student_id' => 'nullable|exists:users,id',
        ]);

        // Determine the student ID
        if ($user->isAdmin()) {
            $studentId = $validated['student_id'] ?? $user->id;
        } else {
            $studentId = $user->id;
        }

        $course = Course::findOrFail($validated['course_id']);

        if (! $course->is_published) {
            return response()->json(['message' => 'This course is not available for enrollment.'], 422);
        }

        if ($course->isFull()) {
            return response()->json(['message' => 'This course has reached its maximum capacity.'], 422);
        }

        $existing = Enrollment::where('student_id', $studentId)
            ->where('course_id', $course->id)
            ->first();

        if ($existing && $existing->status !== 'dropped') {
            return response()->json(['message' => 'Already enrolled in this course.'], 422);
        }

        if ($existing) {
            // Re-activate a previously dropped enrollment
            $existing->update([
                'status'       => 'active',
                'progress'     => 0,
                'grade'        => null,
                'enrolled_at'  => now(),
                'completed_at' => null,
            ]);

            return response()->json($existing->load(['student', 'course.category']), 201);
        }

        $enrollment = Enrollment::create([
            'student_id'  => $studentId,
            'course_id'   => $course->id,
            'status'      => 'active',
            'progress'    => 0,
            'enrolled_at' => now(),
        ]);

        return response()->json($enrollment->load(['student', 'course.category']), 201);
    }

    /**
     * Show a single enrollment.
     */
    public function show(Request $request, Enrollment $enrollment)
    {
        $this->authorizeAccess($request, $enrollment);

        return response()->json($enrollment->load(['student', 'course.category']));
    }

    /**
     * Update progress / status (admin or self).
     */
    public function update(Request $request, Enrollment $enrollment)
    {
        $this->authorizeAccess($request, $enrollment);

        if (! $request->user()->isAdmin()) {
            abort(403, 'Only administrators can update progress or grades.');
        }

        $validated = $request->validate([
            'status'       => 'sometimes|in:active,completed,dropped',
            'progress'     => 'sometimes|integer|min:0|max:100',
            'grade'        => 'nullable|numeric|min:0|max:100',
            'completed_at' => 'nullable|date',
        ]);

        // Auto-complete when progress hits 100
        if (isset($validated['progress']) && $validated['progress'] === 100) {
            $validated['status']       = 'completed';
            $validated['completed_at'] = now();
        }

        $enrollment->update($validated);

        return response()->json($enrollment->load(['student', 'course.category']));
    }

    /**
     * Cancel (drop) an enrollment.
     */
    public function destroy(Request $request, Enrollment $enrollment)
    {
        $this->authorizeAccess($request, $enrollment);

        if ($request->user()->isParent()) {
            abort(403, 'Parents cannot drop enrollments.');
        }

        $enrollment->update(['status' => 'dropped']);

        return response()->json(['message' => 'Enrollment dropped.']);
    }

    private function authorizeAccess(Request $request, Enrollment $enrollment): void
    {
        $user = $request->user()->loadMissing('role');

        if ($user->isAdmin()) {
            return;
        }

        if ($user->isStudent() && $enrollment->student_id === $user->id) {
            return;
        }

        if ($user->isParent()) {
            $childIds = $user->children()->pluck('id');
            if ($childIds->contains($enrollment->student_id)) {
                return;
            }
        }

        abort(403, 'Access denied.');
    }
}
