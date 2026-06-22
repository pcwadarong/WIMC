import imageCompression from "browser-image-compression";

/**
 * 업로드 전 클라이언트 압축 (design.md: 최대 1MB).
 * WebP로 변환해 용량을 더 줄인다. 실패 시 원본 반환.
 */
export async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: "image/webp",
    });
  } catch {
    return file;
  }
}
