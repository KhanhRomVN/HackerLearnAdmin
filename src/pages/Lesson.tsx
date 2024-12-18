// src/pages/Lesson.tsx
import { LessonTable } from "@/components/Lesson/LessonTable";

export default function LessonPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Chapter Lessons</h1>
        <LessonTable />
      </main>
    </div>
  );
}