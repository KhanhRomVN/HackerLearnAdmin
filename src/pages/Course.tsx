// src/pages/Course.tsx
import { CourseTable } from "@/components/Course/CourseTable";

export default function CoursePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6">
        <CourseTable />
      </main>
    </div>
  );
}