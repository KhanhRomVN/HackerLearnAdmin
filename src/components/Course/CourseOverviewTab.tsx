import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";
import { useState } from "react"; 

interface CourseDetail {
  overview: string;
  image7x4Url: string;
  image1x1Url: string;
  name: string;
}

interface CourseOverviewProps {
  selectedCourse: CourseDetail;
  isEditing: boolean;
  onFieldChange: (field: string, value: any) => void;
}

export const CourseOverviewTab = ({ selectedCourse, isEditing, onFieldChange }: CourseOverviewProps) => {
  const [previewImage7x4, setPreviewImage7x4] = useState(selectedCourse.image7x4Url);
  const [previewImage1x1, setPreviewImage1x1] = useState(selectedCourse.image1x1Url);

  const handleImage7x4Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage7x4(imageUrl);
      onFieldChange("image7x4Url", imageUrl);
    }
  };

  const handleImage1x1Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage1x1(imageUrl);
      onFieldChange("image1x1Url", imageUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cover Image Section */}
      <motion.div 
        className="relative group rounded-xl overflow-hidden max-w-4xl mx-auto"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {isEditing ? (
          <div className="space-y-2 p-4 bg-background/80 backdrop-blur rounded-lg">
            <Label className="text-lg font-medium">Course Cover Image (7:4 ratio)</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
              {previewImage7x4 ? (
                <img src={previewImage7x4} alt="Preview 7:4" className="w-full h-auto" />
              ) : (
                <Image className="w-12 h-12 text-gray-400" />
              )}
              <p className="text-sm text-gray-500 text-center">
                Drop your image here or click to upload
              </p>
              <Button variant="outline" size="sm" className="relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImage7x4Upload}
                  accept="image/*"
                />
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={selectedCourse.image7x4Url} 
              alt={selectedCourse.name}
              className="w-full rounded-xl object-cover h-[400px] transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </motion.div>

      {/* Thumbnail and Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-8 items-start w-full">
        {/* Thumbnail Section */}
        <motion.div 
          className="relative group rounded-xl overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {isEditing ? (
            <div className="space-y-2 p-4 bg-background/80 backdrop-blur rounded-lg">
              <Label className="text-lg font-medium">Course Thumbnail (1:1)</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                {previewImage1x1 ? (
                  <img src={previewImage1x1} alt="Preview 1:1" className="w-full h-auto" />
                ) : (
                  <Image className="w-12 h-12 text-gray-400" />
                )}
                <p className="text-sm text-gray-500 text-center">
                  Drop your image here or click to upload
                </p>
                <Button variant="outline" size="sm" className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImage1x1Upload}
                    accept="image/*"
                  />
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={selectedCourse.image1x1Url} 
                alt={`${selectedCourse.name} thumbnail`}
                className="w-full rounded-xl object-cover aspect-square transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </motion.div>

        {/* Overview Section */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Course Overview
          </h3>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                defaultValue={selectedCourse.overview}
                onChange={(e) => onFieldChange("overview", e.target.value)}
                rows={6}
                className="bg-input-background backdrop-blur resize-none w-full p-4"
                placeholder="Enter course overview..."
              />
              <p className="text-sm text-muted-foreground">
                Provide a comprehensive overview of your course content and learning objectives.
              </p>
            </div>
          ) : (
            <div className=" rounded-lg overflow-auto w-[24rem] h-[calc(100vh-24rem)]">
              <p className=" whitespace-pre-wrap break-words">
                {selectedCourse.overview}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};