import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  StorageReference,
} from 'firebase/storage';
import { storage } from './config';

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Validate and upload student profile avatar
 * Constraints: <= 2MB, image/jpeg, image/png, image/webp
 */
export const uploadProfileAvatar = async (
  userId: string,
  file: File
): Promise<UploadResult> => {
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Saiz gambar avatar tidak boleh melebihi 2MB.');
  }

  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format gambar tidak disokong. Sila gunakan JPG, PNG, atau WEBP.');
  }

  const extension = file.name.split('.').pop() || 'jpg';
  const storagePath = `profileImages/${userId}/avatar_${Date.now()}.${extension}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type,
    customMetadata: {
      uploadedBy: userId,
      type: 'profile-avatar',
    },
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return { downloadUrl, storagePath };
};

/**
 * Upload educational materials (Notes/Announcements/Questions)
 * Constraints: <= 10MB, images or PDF (Admin only enforced via storage.rules)
 */
export const uploadEducationalAsset = async (
  folder: 'noteImages' | 'announcementImages' | 'materials',
  referenceId: string,
  file: File
): Promise<UploadResult> => {
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Saiz fail bahan tidak boleh melebihi 10MB.');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format fail tidak disokong. Sila muat naik imej atau PDF sahaja.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${folder}/${referenceId}/${Date.now()}_${cleanFileName}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type,
    customMetadata: {
      type: folder,
      referenceId,
    },
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return { downloadUrl, storagePath };
};

/**
 * Delete a file by full storage path
 */
export const deleteStorageAsset = async (storagePath: string): Promise<void> => {
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting storage asset:', error);
    throw error;
  }
};

export { storage, ref, uploadBytes, getDownloadURL, deleteObject };
