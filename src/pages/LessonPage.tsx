import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { _GET_PUBLIC, _POST, _POST_PUBLIC, _PUT_PUBLIC } from "@/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  X,
  Image as ImageIcon,
  Video,
  Code,
  Type,
  HelpCircle,
  Loader2,
  Edit,
  Trash2,
  Upload
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import YouTube from 'react-youtube';
import { cn } from "@/lib/utils";
import { handleImageSelect } from "@/utils/uploadFirebaseUtil";
import { handleUploadImage } from "@/utils/uploadFirebaseUtil";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CardContent {
  id?: string;
  cardId: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  codeUrl?: string;
  question?: string;
  answer?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
  sequenceOrder: number;
}

interface Card {
  cardId: string;
  lessonId: string;
  sequenceOrder: number;
  contentType1: string | null;
  content1: CardContent | null;
  contentType2: string | null;
  content2: CardContent | null;
  contentType3: string | null;
  content3: CardContent | null;
}

export default function LessonPage() {
  const { lessonId } = useParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingContent, setIsAddingContent] = useState<{
    cardId: string;
    type: string;
  } | null>(null);
  const [newContent, setNewContent] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
    codeUrl: "",
    question: "",
    answer: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "",
  });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<{
    cardId: string;
    contentId: string;
    type: string;
    content: CardContent;
  } | null>(null);

const [previewImage, setPreviewImage] = useState<string>("");

const handleEdit = (cardId: string, contentType: string, content: CardContent) => {
  if (!content?.id) return;
  
  setIsEditing({
    cardId,
    contentId: content.id,
    type: contentType,
    content
  });
  
  // Pre-fill the newContent state with existing content
  setNewContent({
    text: content.text || "",
    imageUrl: content.imageUrl || "",
    videoUrl: content.videoUrl || "",
    codeUrl: content.codeUrl || "",
    question: content.question || "",
    answer: content.answer || "",
    optionA: content.optionA || "",
    optionB: content.optionB || "",
    optionC: content.optionC || "",
    optionD: content.optionD || "",
    correctOption: content.correctOption || "",
  });
};

const handleUpdateContent = async () => {
  if (!isEditing) return;

  let endpoint = "";
  let requestBody: any = {
    id: isEditing.contentId
  };

  try {
    switch (isEditing.type) {
      case 'TEXT':
        endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/text-content/update`;
        requestBody.text = newContent.text;
        break;

      case 'IMAGE':
        endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/image-content/update`;
        requestBody.imageUrl = newContent.imageUrl;
        break;

      case 'VIDEO':
        endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/video-content/update`;
        requestBody.videoUrl = newContent.videoUrl;
        break;

      case 'CODE':
        endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/code-content/update`;
        requestBody.codeUrl = newContent.codeUrl;
        break;

      case 'QUIZZE':
        endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/quizze-content/update`;
        requestBody = {
          ...requestBody,
          question: newContent.question,
          answer: newContent.answer
        };
        break;

      case 'MULTIPLE_QUIZZE':
        endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/multiple-quizze-content/update`;
        requestBody = {
          ...requestBody,
          question: newContent.question,
          optionA: newContent.optionA,
          optionB: newContent.optionB,
          optionC: newContent.optionC,
          optionD: newContent.optionD,
          correctOption: newContent.correctOption
        };
        break;

      default:
        throw new Error("Invalid content type");
    }

    await _PUT_PUBLIC(endpoint, requestBody);
    toast.success("Content updated successfully");
    await fetchCards();
    resetContentForm();
    setIsEditing(null);
  } catch (error) {
    console.error("Failed to update content:", error);
    toast.error("Failed to update content");
    }
  };


  useEffect(() => {
    fetchCards();
  }, [lessonId]);

  const fetchCards = async () => {
    if (!lessonId) return;
    
    try {
      setIsLoading(true);
      const response = await _GET_PUBLIC(
        `${import.meta.env.VITE_MAJOR_SERVICE}/card/get-all-cards-by-lesson-id?lessonId=${lessonId}`
      );
      const cardsData = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
      setCards(cardsData.sort((a: Card, b: Card) => a.sequenceOrder - b.sequenceOrder));
    } catch (error) {
      console.error("Failed to fetch cards:", error);
      toast.error("Failed to fetch cards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!lessonId) return;

    try {
      await _POST(`${import.meta.env.VITE_MAJOR_SERVICE}/card/create`, {
        lessonId,
        sequenceOrder: cards.length + 1
      });
      toast.success("Card created successfully");
      await fetchCards();
    } catch (error) {
      console.error("Failed to create card:", error);
      toast.error("Failed to create card");
    }
  };

  const handleAddContent = async () => {
    if (!isAddingContent || !lessonId) return;

    const { cardId, type } = isAddingContent;
    if (!cardId || !type) return;
    const card = cards.find(c => c.cardId === cardId);
    if (!card) return;

    // Calculate next sequence order
    let nextSequenceOrder = 1;
    if (card.content1) nextSequenceOrder++;
    if (card.content2) nextSequenceOrder++;
    if (card.content3) nextSequenceOrder++;

    let endpoint = "";
    let requestBody: any = {
      cardId: cardId,
      sequenceOrder: nextSequenceOrder
    };

    try {
      switch (type) {
        case 'text':
          endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/text-content/create`;
          requestBody.text = newContent.text;
          break;

        case 'image':
          endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/image-content/create`;
          requestBody.imageUrl = newContent.imageUrl;
          break;

        case 'video':
          endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/video-content/create`;
          requestBody.videoUrl = newContent.videoUrl;
          break;

        case 'code':
          endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/code-content/create`;
          requestBody.codeUrl = newContent.codeUrl;
          break;

        case 'quiz':
          endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/quizze-content/create`;
          requestBody.question = newContent.question;
          requestBody.answer = newContent.answer;
          break;

        case 'multiple-choice':
          endpoint = `${import.meta.env.VITE_MAJOR_SERVICE}/multiple-quizze-content/create`;
          requestBody = {
            ...requestBody,
            question: newContent.question,
            optionA: newContent.optionA,
            optionB: newContent.optionB,
            optionC: newContent.optionC,
            optionD: newContent.optionD,
            correctOption: newContent.correctOption
          };
          break;

        default:
          throw new Error("Invalid content type");
      }

      await _POST_PUBLIC(endpoint, requestBody);
      toast.success("Content added successfully");
      await fetchCards();
      resetContentForm();
    } catch (error) {
      console.error("Failed to add content:", error);
      toast.error("Failed to add content");
    }
  };

  const resetContentForm = () => {
    setIsAddingContent(null);
    setNewContent({
      text: "",
      imageUrl: "",
      videoUrl: "",
      codeUrl: "",
      question: "",
      answer: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "",
    });
  };

  const renderContent = (type: string, content: CardContent) => {
    switch (type) {
      case "TEXT":
        return <p className="whitespace-pre-wrap break-words">{content.text}</p>;
        case "IMAGE":
          return (
            <img 
              src={content.imageUrl} 
              alt="Content" 
              className="w-full rounded-lg cursor-pointer" 
              onClick={() => setFullscreenImage(content.imageUrl || "")}
            />
          );
      case "VIDEO":
          const videoId = extractYouTubeVideoId(content.videoUrl || '');
          return (
            <div className="aspect-video w-full">
              <YouTube 
                videoId={videoId} 
                className="w-full h-full"
                opts={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          );
          case "CODE":
            return (
              <img 
                src={content.codeUrl} 
                alt="Content" 
                className="w-full rounded-lg cursor-pointer" 
                onClick={() => setFullscreenImage(content.codeUrl || "")}
              />
            );
      case "QUIZZE":
        return (
          <div className="space-y-2">
            <p className="font-medium">Question: {content.question}</p>
            <p>Answer: {content.answer}</p>
          </div>
        );
      case "MULTIPLE_QUIZZE":
        return (
          <div className="space-y-2">
            <p className="font-medium">Question: {content.question}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>A: {content.optionA}</div>
              <div>B: {content.optionB}</div>
              <div>C: {content.optionC}</div>
              <div>D: {content.optionD}</div>
            </div>
            <p className="text-green-500">Correct: Option {content.correctOption}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const extractYouTubeVideoId = (url: string) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("v") || urlObj.pathname.split('/').pop();
  };

  const renderCardContent = (card: Card) => {
    // Calculate number of filled content slots
    const contentCount = [card.content1, card.content2, card.content3].filter(Boolean).length;
    
    // Define border color based on content count
    const borderColorClass = {
      0: "border-red-500",
      1: "border-yellow-500",
      2: "border-blue-500",
      3: "border-green-500"
    }[contentCount];
  
    return (
      <div className={cn(
        "flex flex-col bg-background-primary h-[calc(80vh)] relative rounded-lg",
        "border-2", "border-solid pt-12 justify-between",
        borderColorClass
      )}>
        <DropdownMenu>
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Button variant="secondary" size="icon" className="bg-color-primary">
              {card.sequenceOrder}
            </Button>
            <Input
              type="search"
              placeholder="Search..."
              className="h-10 w-20 bg-background-secondary"
            />
            <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="secondary"
      size="icon"
      className="bg-color-primary"
    >
      <Edit className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  
  {/* Chỉ hiển thị DropdownMenuContent khi có nhiều hơn 1 content */}
  {[card.content1, card.content2, card.content3].filter(Boolean).length > 0 ? (
    <DropdownMenuContent className="w-56 bg-background-secondary border-gray-400 border-solid">
      {card.content1 && (
        <DropdownMenuItem 
          onClick={() => handleEdit(card.cardId, card.contentType1!, card.content1!)}
          className="hover:bg-background-primary cursor-pointer"
        >
          Content 1 ({card.contentType1})
        </DropdownMenuItem>
      )}
      {card.content2 && (
        <DropdownMenuItem 
          onClick={() => handleEdit(card.cardId, card.contentType2!, card.content2!)}
          className="hover:bg-background-primary cursor-pointer"
        >
          Content 2 ({card.contentType2})
        </DropdownMenuItem>
      )}
      {card.content3 && (
        <DropdownMenuItem 
          onClick={() => handleEdit(card.cardId, card.contentType3!, card.content3!)}
          className="hover:bg-background-primary cursor-pointer"
        >
          Content 3 ({card.contentType3})
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  ) : (
    // Nếu chỉ có 1 content, click trực tiếp vào nút sẽ edit content đó
    <DropdownMenuContent 
      className="w-56 bg-background-secondary border-gray-400 border-solid"
      onClick={() => {
        const content = card.content1 || card.content2 || card.content3;
        const contentType = card.contentType1 || card.contentType2 || card.contentType3;
        if (content && contentType) {
          handleEdit(card.cardId, contentType, content);
        }
      }}
    />
  )}
</DropdownMenu>
            <Button
              variant="secondary"
              size="icon"
              className="bg-color-primary"
            >
              <Loader2 className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-color-primary text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-color-primary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="w-56 bg-background-secondary border-gray-400 border-solid">
            <DropdownMenuItem onClick={() => setIsAddingContent({ cardId: card.cardId, type: "text" })} className="hover:bg-background-primary cursor-pointer">
              <Type className="mr-2 h-4 w-4" /> Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddingContent({ cardId: card.cardId, type: "image" })} className="hover:bg-background-primary cursor-pointer">
              <ImageIcon className="mr-2 h-4 w-4" /> Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddingContent({ cardId: card.cardId, type: "video" })} className="hover:bg-background-primary cursor-pointer">
              <Video className="mr-2 h-4 w-4" /> Video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddingContent({ cardId: card.cardId, type: "code" })} className="hover:bg-background-primary cursor-pointer">
              <Code className="mr-2 h-4 w-4" /> Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddingContent({ cardId: card.cardId, type: "quiz" })} className="hover:bg-background-primary cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" /> Quiz
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddingContent({ cardId: card.cardId, type: "multiple-choice" })} className="hover:bg-background-primary cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" /> Multiple Choice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  
        <div className="h-full overflow-auto custom-scrollbar">
          {[1, 2, 3].map((slot) => {
            const contentType = card[`contentType${slot}` as keyof Card];
            const content = card[`content${slot}` as keyof Card];
  
            return content && (
              <motion.div
                key={slot}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: slot * 0.1 }}
                className="relative"
              >
                <div className="p-4 rounded-lg bg-accent/50 hover:bg-accent/70 transition-all">
                  {renderContent(contentType as string, content as CardContent)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                    onClick={() => handleEdit(card.cardId, contentType as string, content as CardContent)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
  
        <div className="absolute bottom-0 left-0 w-full bg-color-primary h-auto">
          {(isAddingContent?.cardId === card.cardId || isEditing?.cardId === card.cardId) && 
            renderContentForm(isEditing?.cardId === card.cardId)}
        </div>
      </div>
    );
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelect(event, setSelectedImage, () => {});
    if (event.target.files && event.target.files[0]) {
      const imageUrl = await handleUploadImage(event.target.files[0]);
      if (imageUrl) {
        setPreviewImage(imageUrl);
        setNewContent(prev => ({ 
          ...prev, 
          imageUrl: imageUrl,
          codeUrl: imageUrl // Also set codeUrl since we're using images for both
        }));
      }
    }
  };

  const renderContentForm = (isEditMode: boolean = false) => {
    if (!isAddingContent && !isEditing) return null;
  
    const currentContent = isEditing || isAddingContent;
    const contentType = isEditMode ? isEditing?.type : isAddingContent?.type;
  
    return (
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {isEditMode ? 'Edit' : 'Add'} {contentType} Content
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                resetContentForm();
                setIsEditing(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
  
          <div className="space-y-4">
            {(contentType === 'text' || contentType === 'TEXT') && (
              <div>
                <Label>Text Content</Label>
                <Textarea
                  value={newContent.text}
                  onChange={e => setNewContent({ ...newContent, text: e.target.value })}
                  placeholder="Enter your text content..."
                  className="min-h-[200px]"
                />
              </div>
            )}
  
            {(contentType === 'image' || contentType === 'IMAGE' || 
              contentType === 'code' || contentType === 'CODE') && (
              <div>
                <Label>{contentType === 'image' || contentType === 'IMAGE' ? 'Image Upload' : 'Code Image Upload'}</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                  <p className="text-sm text-gray-500 text-center">
                    Drop your image here or click to upload
                  </p>
                  <Button variant="outline" size="sm" className="relative">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>
            )}
  
            {(contentType === 'video' || contentType === 'VIDEO') && (
              <div>
                <Label>Video URL</Label>
                <Input
                  value={newContent.videoUrl}
                  onChange={e => setNewContent({ ...newContent, videoUrl: e.target.value })}
                  placeholder="Enter video URL..."
                />
              </div>
            )}
  
            {(contentType === 'quiz' || contentType === 'QUIZZE') && (
              <div className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={newContent.question}
                    onChange={e => setNewContent({ ...newContent, question: e.target.value })}
                    placeholder="Enter question..."
                  />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Input
                    value={newContent.answer}
                    onChange={e => setNewContent({ ...newContent, answer: e.target.value })}
                    placeholder="Enter answer..."
                  />
                </div>
              </div>
            )}
  
            {(contentType === 'multiple-choice' || contentType === 'MULTIPLE_QUIZZE') && (
              <div className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={newContent.question}
                    onChange={e => setNewContent({ ...newContent, question: e.target.value })}
                    placeholder="Enter question..."
                  />
                </div>
                {['A', 'B', 'C', 'D'].map(option => (
                  <div key={option}>
                    <Label>Option {option}</Label>
                    <Input
                      value={newContent[`option${option}` as keyof typeof newContent]}
                      onChange={e => setNewContent({
                        ...newContent,
                        [`option${option}`]: e.target.value
                      })}
                      placeholder={`Enter option ${option}...`}
                    />
                  </div>
                ))}
                <div>
                  <Label>Correct Option</Label>
                  <Select
                    value={newContent.correctOption}
                    onValueChange={(value) => setNewContent({ ...newContent, correctOption: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct option" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A', 'B', 'C', 'D'].map(option => (
                        <SelectItem key={option} value={option}>
                          Option {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
  
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  resetContentForm();
                  setIsEditing(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={isEditMode ? handleUpdateContent : handleAddContent}>
                {isEditMode ? 'Update' : 'Add'} Content
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-3rem)] ">
      <div className="flex justify-between items-center mb-8">
        <p className="text-xl font-semibold">Dashboard / Lesson</p>
        <Button onClick={handleAddCard} className="gap-2 border-solid" variant="outline">
          <Plus className="h-4 w-4" />
          Add New Card
        </Button>
      </div>
      {/* Card Slider */}
      <div className="relative overflow-auto h-[calc(100vh-10rem)] custom-scrollbar">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : cards.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {cards.map((card, index) => (
                <motion.div
                  key={card.cardId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg"
                >
                  {renderCardContent(card)}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Plus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No cards yet. Create your first card!</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <img 
            src={fullscreenImage || ''} 
            alt="Fullscreen content" 
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}