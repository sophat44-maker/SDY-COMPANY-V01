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

/**
 * Extracts the unique Google Drive File ID from any Google Drive URL or CDN URL.
 */
export function extractGoogleDriveFileId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Pattern 1: lh3.googleusercontent.com/d/FILE_ID
  const cdnMatch = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  if (cdnMatch && cdnMatch[1]) return cdnMatch[1];

  // Pattern 2: drive.google.com/file/d/FILE_ID
  const fileDMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 3: id=FILE_ID in query params
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  return null;
}

/**
 * Gets a clean Google Drive PDF View URL (opens Google Drive web viewer with download option).
 */
export function getGoogleDriveViewUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return url.trim();
}

/**
 * Gets a direct Google Drive File Download URL.
 */
export function getGoogleDriveDownloadUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url.trim();
}

