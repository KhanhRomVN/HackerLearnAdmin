import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Upload, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { handleImageSelect, handleUploadImage } from "@/utils/uploadFirebaseUtil";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { _POST_PUBLIC } from "@/api";

export default function CreateCoursePage() {
  const [formData, setFormData] = useState({
    name: "",
    overview: "",
    objectives: [""],
    requirementsCourseId: "" as string | null,
    level: "",
    duration: 0,
    price: 0,
    startDate: "",
    endDate: "",
    language: [""],
    status: "DRAFT",
    image7x4Url: "",
    image1x1Url: "",
  });

  // Image states
  const [, setSelectedImage7x4] = useState<File[]>([]);
  const [, setSelectedImage1x1] = useState<File[]>([]);
  const [previewImage7x4, setPreviewImage7x4] = useState<string>("");
  const [previewImage1x1, setPreviewImage1x1] = useState<string>("");

  // Handle form field changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle objectives array
  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleAddObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, ""]
    }));
  };

  const handleRemoveObjective = (index: number) => {
    const newObjectives = formData.objectives.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  // Handle languages array
  const handleLanguageChange = (index: number, value: string) => {
    const newLanguages = [...formData.language];
    newLanguages[index] = value;
    setFormData(prev => ({ ...prev, language: newLanguages }));
  };

  const handleAddLanguage = () => {
    setFormData(prev => ({
      ...prev,
      language: [...prev.language, ""]
    }));
  };

  const handleRemoveLanguage = (index: number) => {
    const newLanguages = formData.language.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, language: newLanguages }));
  };

  // Handle image uploads
  const handleImage7x4Upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelect(event, setSelectedImage7x4, () => {});
    if (event.target.files && event.target.files[0]) {
      const imageUrl = await handleUploadImage(event.target.files[0]);
      if (imageUrl) {
        setPreviewImage7x4(imageUrl);
        setFormData(prev => ({ ...prev, image7x4Url: imageUrl }));
      }
    }
  };

  const handleImage1x1Upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelect(event, setSelectedImage1x1, () => {});
    if (event.target.files && event.target.files[0]) {
      const imageUrl = await handleUploadImage(event.target.files[0]);
      if (imageUrl) {
        setPreviewImage1x1(imageUrl);
        setFormData(prev => ({ ...prev, image1x1Url: imageUrl }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      console.log(formData);
      if (formData.requirementsCourseId === "") {
        formData.requirementsCourseId = null;
      }
      const response = await _POST_PUBLIC(`${import.meta.env.VITE_MAJOR_SERVICE}/course/create`, formData);
      
      if (response.ok) {
        console.log("Course created successfully");
        // Add success notification or redirect here
      }
    } catch (error) {
      console.error("Error creating course:", error);
      // Add error notification here
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-8 px-4"
    >
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Create New Course
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter course name"
                className="bg-red-400"
              />
            </div>

            <div>
              <Label htmlFor="overview">Overview</Label>
              <Textarea
                id="overview"
                value={formData.overview}
                onChange={(e) => handleInputChange('overview', e.target.value)}
                placeholder="Enter course overview"
                className="min-h-[100px]"
              />
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Select
                  onValueChange={(value) => handleInputChange('level', value)}
                  value={formData.level}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  placeholder="Enter duration in hours"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
  <div>
    <Label htmlFor="startDate">Start Date</Label>
    <Input
      id="startDate"
      type="datetime-local" // Changed from 'date' to 'datetime-local'
      value={formData.startDate}
      onChange={(e) => handleInputChange('startDate', e.target.value)}
    />
  </div>

  <div>
    <Label htmlFor="endDate">End Date</Label>
    <Input
      id="endDate"
      type="datetime-local" // Changed from 'date' to 'datetime-local'
      value={formData.endDate}
      onChange={(e) => handleInputChange('endDate', e.target.value)}
    />
  </div>
</div>

            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                placeholder="Enter course price"
              />
            </div>

            <div>
              <Label htmlFor="requirementsCourseId">Requirements Course ID</Label>
              <Input
                id="requirementsCourseId"
                value={formData.requirementsCourseId || ""}
                onChange={(e) => handleInputChange('requirementsCourseId', e.target.value)}
                placeholder="Enter requirements course ID"
              />
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-4">
            <Label>Objectives</Label>
            {formData.objectives.map((objective, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2"
              >
                <Input
                  value={objective}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  placeholder={`Objective ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveObjective(index)}
                  disabled={formData.objectives.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddObjective}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Objective
            </Button>
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <Label>Languages</Label>
            {formData.language.map((lang, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2"
              >
                <Input
                  value={lang}
                  onChange={(e) => handleLanguageChange(index, e.target.value)}
                  placeholder={`Language ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveLanguage(index)}
                  disabled={formData.language.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddLanguage}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Language
            </Button>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image7x4">Image (7:4)</Label>
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

            <div>
              <Label htmlFor="image1x1">Image (1:1)</Label>
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
          </div>

          {/* Submit Button */}
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.overview}
          >
            Create Course
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}