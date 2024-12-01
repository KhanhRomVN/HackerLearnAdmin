import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Award, 
  Clock, 
  DollarSign, 
  Languages, 
  Calendar, 
  Settings,
  CheckCircle,
  Plus,
  X,
  Target,
  Sparkles,
  Timer,
  Globe,
  CalendarRange
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CourseDetail {
  level: string;
  duration: number;
  price: number;
  language: string[];
  startDate: string;
  endDate: string;
  objectives: string[];
}

interface CourseDetailsTabProps {
  selectedCourse: CourseDetail;
  isEditing: boolean;
  onFieldChange: (field: string, value: any) => void;
}

export const CourseDetailsTab = ({ selectedCourse, isEditing, onFieldChange }: CourseDetailsTabProps) => {
  return (
    <div className="space-y-8">
      {/* Course Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Basic Details */}
        <Card className="bg-card/50 backdrop-blur border-none shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-primary" />
              Basic Details
            </h3>
            
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Difficulty Level</Label>
                    <Select
                      defaultValue={selectedCourse.level}
                      onValueChange={(value) => onFieldChange("level", value)}
                    >
                      <SelectTrigger className="w-full bg-input-background backdrop-blur">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background-secondary">
                        <SelectItem value="Beginner">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-green-500" />
                            Beginner
                          </div>
                        </SelectItem>
                        <SelectItem value="Intermediate">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-yellow-500" />
                            Intermediate
                          </div>
                        </SelectItem>
                        <SelectItem value="Advanced">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-red-500" />
                            Advanced
                          </div>
                        </SelectItem>
                        <SelectItem value="Expert">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-purple-500" />
                            Expert
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Duration (hours)</Label>
                    <div className="relative">
                      <Timer className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        defaultValue={selectedCourse.duration}
                        onChange={(e) => onFieldChange("duration", parseInt(e.target.value))}
                        className="pl-9 bg-input-background backdrop-blur"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Price ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        defaultValue={selectedCourse.price}
                        onChange={(e) => onFieldChange("price", parseFloat(e.target.value))}
                        className="pl-9 bg-input-background backdrop-blur"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Languages</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        defaultValue={selectedCourse.language.join(", ")}
                        onChange={(e) => onFieldChange("language", e.target.value.split(", "))}
                        className="pl-9 bg-input-background backdrop-blur"
                        placeholder="e.g. English, Spanish"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-4">
                  <motion.div 
                    className="p-4 rounded-lg bg-accent/50 backdrop-blur hover:bg-accent/70 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Level</p>
                        <p className="text-lg font-semibold">{selectedCourse.level}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-4 rounded-lg bg-accent/50 backdrop-blur hover:bg-accent/70 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                        <p className="text-lg font-semibold">{selectedCourse.duration} hours</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-4 rounded-lg bg-accent/50 backdrop-blur hover:bg-accent/70 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Price</p>
                        <p className="text-lg font-semibold">${selectedCourse.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-4 rounded-lg bg-accent/50 backdrop-blur hover:bg-accent/70 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Languages className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Languages</p>
                        <p className="text-lg font-semibold">{selectedCourse.language.join(", ")}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="bg-card/50 backdrop-blur border-none shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <CalendarRange className="h-5 w-5 text-primary" />
              Schedule
            </h3>

            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        defaultValue={selectedCourse.startDate.split('T')[0]}
                        onChange={(e) => onFieldChange("startDate", e.target.value)}
                        className="pl-9 bg-input-background backdrop-blur"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        defaultValue={selectedCourse.endDate.split('T')[0]}
                        onChange={(e) => onFieldChange("endDate", e.target.value)}
                        className="pl-9 bg-input-background backdrop-blur"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-4">
                  <motion.div 
                    className="p-4 rounded-lg bg-accent/50 backdrop-blur hover:bg-accent/70 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                        <p className="text-lg font-semibold">
                          {new Date(selectedCourse.startDate).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-4 rounded-lg bg-accent/50 backdrop-blur hover:bg-accent/70 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">End Date</p>
                        <p className="text-lg font-semibold">
                          {new Date(selectedCourse.endDate).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator className="my-8" />

      {/* Learning Objectives Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-card/50 backdrop-blur border-none shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-primary" />
              Learning Objectives
            </h3>

            <AnimatePresence mode="popLayout">
              {isEditing ? (
                <motion.div className="space-y-3">
                  {selectedCourse.objectives.map((objective, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-2"
                    >
                      <div className="relative flex-1">
                        <CheckCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          defaultValue={objective}
                          onChange={(e) => {
                            const newObjectives = [...selectedCourse.objectives];
                            newObjectives[index] = e.target.value;
                            onFieldChange("objectives", newObjectives);
                          }}
                          className="pl-9 bg-background/50 backdrop-blur"
                          placeholder={`Objective ${index + 1}`}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newObjectives = selectedCourse.objectives.filter((_, i) => i !== index);
                          onFieldChange("objectives", newObjectives);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newObjectives = [...selectedCourse.objectives, ""];
                      onFieldChange("objectives", newObjectives);
                    }}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Objective
                  </Button>
                </motion.div>
              ) : (
                <motion.div className="grid gap-3">
                  {selectedCourse.objectives.map((objective, index) => (
                    objective && (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-accent/50 backdrop-blur hover:bg-accent/70 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-muted-foreground">{objective}</p>
                        </div>
                      </motion.div>
                    )
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};