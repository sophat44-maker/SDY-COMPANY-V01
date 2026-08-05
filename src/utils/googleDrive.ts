/**
 * Converts standard Google Drive view/share URLs into direct embeddable image URLs.
 * E.g., https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * or https://drive.google.com/open?id=FILE_ID
 * -> https://lh3.googleusercontent.com/d/FILE_ID
 */
export function transformGoogleDriveUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already a direct Google CDN link
  if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    return trimmed;
  }

  // Pattern 1: drive.google.com/file/d/FILE_ID/...
  const fileDMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // Pattern 2: drive.google.com/...id=FILE_ID or docs.google.com/...id=FILE_ID
  const idParamMatch = trimmed.match(/(?:drive|docs)\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
  }

  return trimmed;
}
