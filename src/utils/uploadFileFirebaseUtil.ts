import { fileDB } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const handleFileSelect = (
  event: React.ChangeEvent<HTMLInputElement>,
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (event.target.files && event.target.files.length > 0) {
    const filesArray = Array.from(event.target.files);
    setSelectedFiles(filesArray);
    setIsModalOpen(true);
  }
};

export const handleUploadFile = async (
  file: File
): Promise<string | null> => {
  // Tạo reference với path là files/[uuid]/[filename]
  const storageRef = ref(fileDB, `files/${uuidv4()}_${file.name}`);

  try {
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading file: ", error);
    return null;
  }
};