import React, { useState } from 'react';
import Icon from './icons';

const gradients = [
  'from-brand-500 to-violet-600',
  'from-sky-500 to-brand-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-rose-500',
];

/**
 * Course thumbnail. Uses the course's own image; when it is missing a deterministic
 * placeholder photo is used, and if that fails to load a gradient with an icon is shown.
 */
export default function CourseImage({ course, className = 'h-40 w-full' }) {
  const [failed, setFailed] = useState(false);
  const seed = course?.slug || course?.id || 'course';
  const src = course?.image || `https://picsum.photos/seed/${seed}/800/450`;
  const gradient = gradients[Number(course?.id || 0) % gradients.length];

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${gradient} text-white/80 ${className}`} role="img" aria-label={course?.title}>
        <Icon name="book" className="h-10 w-10" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={course?.title || 'Course'}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`bg-slate-200 object-cover ${className}`}
    />
  );
}
