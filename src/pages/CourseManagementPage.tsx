import { useState } from "react";
import { CourseSidebar } from "@/components/Sidebar/CourseSidebar";
import { _GET_PUBLIC, _PUT } from "@/api";
import { toast } from "react-hot-toast";
import { CourseDetails } from "@/components/Course/CourseDetail";

interface CourseDetail {
  id: string;
  name: string;
  overview: string;
  objectives: string[];
  duration: number;
  price: number;
  startDate: string;
  endDate: string;
  language: string[];
  status: string;
  level: string;
  image7x4Url: string;
  image1x1Url: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

const CourseManagementPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);

  const handleSelectCourse = async (courseId: string) => {
    try {
      const data = await _GET_PUBLIC(`${import.meta.env.VITE_MAJOR_SERVICE}/course?courseId=${courseId}`);
      setSelectedCourse(data);
    } catch (error) {
      console.error("Failed to fetch course details:", error);
      toast.error("Failed to fetch course details");
    }
  };

  const handleUpdate = async (field: string, value: any) => {
    try {
      if (!selectedCourse?.id) return;

      const endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/course/update/${field}`;
      const response = await _PUT(endpoint, {
        courseId: selectedCourse.id,
        [field]: value
      });

      if (response) {
        toast.success(`Updated ${field} successfully`);
        await handleSelectCourse(selectedCourse.id);
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] p-4">
      <div className="flex h-[calc(100%-4rem)] gap-4">
        <div className="w-[30%] border rounded-lg">
          <CourseSidebar 
            onSelectCourse={handleSelectCourse}
            selectedCourseId={selectedCourse?.id}
          />
        </div>

        <div className="w-[70%] h-[calc(100vh-4rem)] overflow-hidden rounded-lg">
        <CourseDetails 
          selectedCourse={selectedCourse}
          onUpdate={handleUpdate}
        />
        </div>
      </div>
    </div>
  );
};

export default CourseManagementPage;