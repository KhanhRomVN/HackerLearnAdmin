// src/pages/Chapter.tsx
import { ChapterTable } from "@/components/Chapter/ChapterTable";
export default function ChapterPage() {

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Course Chapters</h1>
        <ChapterTable />
      </main>
    </div>
  );
}