/**
 * YouTube Utility Helper
 * Provides robust extraction of YouTube Video IDs, URL validation,
 * embed URL generation, and thumbnail helpers.
 */

/**
 * Robust function to extract the exact 11-character Video ID from any standard YouTube URL.
 * Handles:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID&t=10s
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtu.be/VIDEO_ID?t=10s
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw 11-character video ID (e.g. dQw4w9WgXcQ)
 * 
 * @param url The YouTube URL or video ID string
 * @returns The extracted 11-character video ID or null if invalid
 */
export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();

  // If already an 11-character video ID (alphanumeric, -, _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL regex patterns
  // Matches:
  // - youtube.com/watch?v=...
  // - youtube.com/embed/...
  // - youtube.com/v/...
  // - youtube.com/shorts/...
  // - youtu.be/...
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback parsing via URL API for exotic query parameters or mobile formats
  try {
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }

      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      if (
        (pathSegments[0] === 'embed' || pathSegments[0] === 'v' || pathSegments[0] === 'shorts') &&
        pathSegments[1]
      ) {
        const id = pathSegments[1].substring(0, 11);
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return id;
        }
      }
    } else if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '').split(/[?#]/)[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }
  } catch {
    // Malformed URL, return null
  }

  return null;
}

/**
 * Checks if a given string is a valid YouTube URL or ID.
 */
export function isValidYouTubeUrl(url: string | null | undefined): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Generates an iframe embed URL for a given YouTube URL or Video ID.
 * Standard format: https://www.youtube.com/embed/${extractedVideoId}
 */
export function getYoutubeEmbedUrl(urlOrId: string | null | undefined, options?: { autoplay?: boolean; rel?: number }): string | null {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return null;

  const params = new URLSearchParams();
  params.set('rel', String(options?.rel ?? 0));
  params.set('modestbranding', '1');
  if (options?.autoplay) {
    params.set('autoplay', '1');
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Returns a high-quality or standard YouTube thumbnail image URL.
 */
export function getYoutubeThumbnailUrl(
  urlOrId: string | null | undefined,
  quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'default' = 'hqdefault'
): string | null {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
