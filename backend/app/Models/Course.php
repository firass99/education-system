<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'category_id',
        'instructor_id',
        'level',
        'price',
        'duration_hours',
        'image',
        'is_published',
        'max_students',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_published' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'course_id', 'student_id')
                    ->withPivot('status', 'progress', 'grade', 'enrolled_at', 'completed_at')
                    ->withTimestamps();
    }

    public function enrolledStudentsCount()
    {
        return $this->enrollments()->where('status', 'active')->count();
    }

    public function isFull()
    {
        return $this->max_students && $this->enrolledStudentsCount() >= $this->max_students;
    }
}
