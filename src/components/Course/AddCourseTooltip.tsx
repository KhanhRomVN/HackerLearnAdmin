import { useState } from "react";
import { LoadBalancerService } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "react-hot-toast";
import { Plus, Upload, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useDropzone } from 'react-dropzone';
import { handleUploadImage } from '@/utils/uploadImageFirebaseUtil';

interface Course {
  id: string;
  name: string;
}

export function AddCourseTooltip() {
  const [formData, setFormData] = useState({
    name: "",
    overview: "",
    requirements_course_id: null as string | null,
    level: "Beginner",
    duration: 30,
    price: 100,
    status: "active",
    image_url: "",
  });

  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedImage(acceptedFiles[0]);
        setIsUploading(true);
        try {
          const imageUrl = await handleUploadImage(acceptedFiles[0]);
          if (imageUrl) {
            setFormData({ ...formData, image_url: imageUrl });
            toast.success('Image uploaded successfully');
          }
        } catch (error) {
          toast.error('Failed to upload image');
        } finally {
          setIsUploading(false);
        }
      }
    }
  });

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const api = new LoadBalancerService();
    try {
      const response = await api.getPublic({
        endpoint: `/course/search?name=${encodeURIComponent(searchTerm)}`,
      });

      if (response.data && Array.isArray(response.data)) {
        setSearchResults(response.data as Course[]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching courses:", error);
      toast.error("Failed to search courses");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.overview) {
      toast.error("Please fill in all required fields");
      return;
    }

    const api = new LoadBalancerService();
    try {
      const response = await api.postPublic({
        endpoint: "/course",
        reqBody: formData,
      });

      if (response.data) {
        toast.success("Course created successfully");
        setOpen(false);
        // Reset form
        setFormData({
          name: "",
          overview: "",
          requirements_course_id: null,
          level: "Beginner",
          duration: 30,
          price: 100,
          status: "active",
          image_url: "",
        });
      } else {
        toast.error("Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          className="flex items-center gap-2 bg-button-primary hover:bg-color-primary text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[800px] bg-background-secondary p-6"
        side="right"
        align="start"
      >
        <div className="space-y-6">
          <h3 className="text-xl font-semibold border-b pb-2">Add New Course</h3>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="required">Course Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter course name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="overview" className="required">Overview</Label>
                <Textarea
                  id="overview"
                  value={formData.overview}
                  onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="Enter course overview"
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements Course</Label>
                <Command className="border rounded-md">
                  <CommandInput 
                    placeholder="Search courses..." 
                    onValueChange={handleSearch}
                  />
                  <CommandEmpty>
                    {isSearching ? "Searching..." : "No courses found"}
                  </CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-y-auto">
                    {searchResults.map((course) => (
                      <CommandItem
                        key={course.id}
                        onSelect={() => {
                          setFormData({ ...formData, requirements_course_id: course.id });
                        }}
                      >
                        {course.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div 
                {...getRootProps()} 
                className={`
                  border-2 border-dashed rounded-lg p-6
                  text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-3">
                  {formData.image_url ? (
                    <img 
                      src={formData.image_url} 
                      alt="Course preview" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {isUploading ? "Uploading..." : "Drop image here or click to upload"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPG, PNG (max 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full mt-6"
                disabled={isUploading || !formData.name || !formData.overview}
              >
                Create Course
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}