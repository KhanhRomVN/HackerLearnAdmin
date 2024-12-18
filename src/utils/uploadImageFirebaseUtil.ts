import { imageDB } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const handleImageSelect = (
  event: React.ChangeEvent<HTMLInputElement>,
  setSelectedImages: React.Dispatch<React.SetStateAction<File[]>>,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (event.target.files && event.target.files.length > 0) {
    const filesArray = Array.from(event.target.files);
    setSelectedImages(filesArray);
    setIsModalOpen(true);
  }
};

export const handleUploadImage = async (
  image: File
): Promise<string | null> => {
  const storageRef = ref(imageDB, `images/${uuidv4()}`);

  try {
    await uploadBytes(storageRef, image);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading image: ", error);
    return null;
  }
};