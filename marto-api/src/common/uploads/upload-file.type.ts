/**
 * Structural type for files received by Multer memory storage.
 * Kept local to avoid relying on Express.Multer namespace augmentation.
 */
export interface UploadedImageFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
