import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '../config/firebase';

// Função para fazer upload de um arquivo
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Função para fazer upload de múltiplos arquivos
export const uploadMultipleFiles = async (files, basePath) => {
  try {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${file.name}`;
      return uploadFile(file, path);
    });
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

// Função para deletar um arquivo
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Função para fazer upload de uma imagem de poster
export const uploadPoster = async (file, contentId) => {
  const path = `posters/${contentId}/${file.name}`;
  return uploadFile(file, path);
};

// Função para fazer upload de uma imagem de backdrop
export const uploadBackdrop = async (file, contentId) => {
  const path = `backdrops/${contentId}/${file.name}`;
  return uploadFile(file, path);
};

// Função para fazer upload de um vídeo
export const uploadVideo = async (file, contentId) => {
  const path = `videos/${contentId}/${file.name}`;
  return uploadFile(file, path);
}; 