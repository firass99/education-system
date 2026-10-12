<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = CourseCategory::withCount('courses');

        if (! $request->user('sanctum')?->loadMissing('role')->isAdmin()) {
            $query->where('is_active', true);
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['name']);

        return response()->json(CourseCategory::create($validated), 201);
    }

    public function show(CourseCategory $courseCategory)
    {
        return response()->json($courseCategory->load('courses'));
    }

    public function update(Request $request, CourseCategory $courseCategory)
    {
        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = $this->uniqueSlug($validated['name'], $courseCategory->id);
        }

        $courseCategory->update($validated);

        return response()->json($courseCategory);
    }

    public function destroy(Request $request, CourseCategory $courseCategory)
    {
        $courseCategory->delete();

        return response()->json(['message' => 'Category deleted.']);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (CourseCategory::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
