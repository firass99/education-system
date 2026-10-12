<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Return dashboard statistics appropriate to the authenticated user's role.
     */
    public function index(Request $request)
    {
        $user = $request->user()->load('role');

        return match ($user->role?->name) {
            'admin'   => $this->adminStats(),
            'student' => $this->studentStats($user),
            'parent'  => $this->parentStats($user),
            default   => response()->json(['message' => 'No dashboard available.'], 403),
        };
    }

    private function adminStats(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'total_students'    => User::whereHas('role', fn($q) => $q->where('name', 'student'))->count(),
            'total_parents'     => User::whereHas('role', fn($q) => $q->where('name', 'parent'))->count(),
            'total_courses'     => Course::count(),
            'published_courses' => Course::where('is_published', true)->count(),
            'total_categories'  => CourseCategory::count(),
            'total_enrollments' => Enrollment::count(),
            'active_enrollments' => Enrollment::where('status', 'active')->count(),
            'completed_enrollments' => Enrollment::where('status', 'completed')->count(),
            'recent_enrollments' => Enrollment::with(['student', 'course'])
                ->latest()
                ->take(5)
                ->get(),
            'popular_courses' => Course::withCount(['enrollments' => fn($q) => $q->where('status', 'active')])
                ->orderByDesc('enrollments_count')
                ->take(5)
                ->get(),
        ]);
    }

    private function studentStats(User $user): \Illuminate\Http\JsonResponse
    {
        $enrollments = Enrollment::where('student_id', $user->id)
            ->with('course.category')
            ->get();

        return response()->json([
            'total_enrolled'   => $enrollments->count(),
            'completed'        => $enrollments->where('status', 'completed')->count(),
            'in_progress'      => $enrollments->where('status', 'active')->count(),
            'average_progress' => $enrollments->whereIn('status', ['active'])->avg('progress') ?? 0,
            'average_grade'    => $enrollments->whereNotNull('grade')->avg('grade') ?? 0,
            'enrollments'      => $enrollments,
        ]);
    }

    private function parentStats(User $user): \Illuminate\Http\JsonResponse
    {
        $children     = User::where('parent_id', $user->id)->get();
        $childrenIds  = $children->pluck('id');
        $enrollments  = Enrollment::whereIn('student_id', $childrenIds)
            ->with(['student', 'course.category'])
            ->get();

        $childStats = $children->map(function (User $child) use ($enrollments) {
            $childEnrollments = $enrollments->where('student_id', $child->id);
            return [
                'student'          => $child,
                'total_enrolled'   => $childEnrollments->count(),
                'completed'        => $childEnrollments->where('status', 'completed')->count(),
                'average_progress' => $childEnrollments->where('status', 'active')->avg('progress') ?? 0,
                'average_grade'    => $childEnrollments->whereNotNull('grade')->avg('grade') ?? 0,
            ];
        });

        return response()->json([
            'children'     => $childStats,
            'enrollments'  => $enrollments,
        ]);
    }
}
