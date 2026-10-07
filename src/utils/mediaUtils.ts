import heroDealsImg from '../assets/images/hero_affiliate_deals_1791387714076.jpg';
import earbudsImg from '../assets/images/product_anc_earbuds_1791387733714.jpg';
import smartwatchImg from '../assets/images/product_pro_smartwatch_1791387747201.jpg';
import festiveBannerImg from '../assets/images/banner_ad_festive_sale_1791387761449.jpg';

// High-reliability CDN fallbacks for production (Vercel, Netlify, Custom Domains)
export const CDN_FALLBACKS = {
  hero: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  smartwatch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  fashion: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80',
  kitchen: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
  beauty: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
};

// Map of bundled image assets guaranteed to be included in Vite output
export const BUNDLED_IMAGES: Record<string, string> = {
  hero_affiliate_deals: heroDealsImg,
  product_anc_earbuds: earbudsImg,
  product_pro_smartwatch: smartwatchImg,
  banner_ad_festive_sale: festiveBannerImg,
};

/**
 * Resolves any image URL to ensure it works on Vercel, Netlify, and local dev
 */
export function resolveImageUrl(url?: string, fallbackKey: keyof typeof CDN_FALLBACKS = 'hero'): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return CDN_FALLBACKS[fallbackKey] || CDN_FALLBACKS.hero;
  }

  const trimmed = url.trim();

  // If already an absolute HTTP/HTTPS URL, return it directly
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image')) {
    return trimmed;
  }

  // Match bundled assets compiled by Vite
  if (trimmed.includes('hero_affiliate_deals')) return heroDealsImg;
  if (trimmed.includes('product_anc_earbuds')) return earbudsImg;
  if (trimmed.includes('product_pro_smartwatch')) return smartwatchImg;
  if (trimmed.includes('banner_ad_festive_sale')) return festiveBannerImg;

  // Rewrite legacy development /src/assets/images/ to public /images/
  if (trimmed.startsWith('/src/assets/images/')) {
    const filename = trimmed.replace('/src/assets/images/', '');
    return `/images/${filename}`;
  }

  return trimmed;
}

/**
 * Extracts YouTube Video ID from any format (watch, youtu.be, shorts, embed)
 */
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
      const match = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : null;
    }
    if (url.includes('youtube.com/shorts/')) {
      const match = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : null;
    }
    if (url.includes('youtube.com/watch')) {
      const parsed = new URL(url);
      return parsed.searchParams.get('v');
    }
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      const candidate = parts[1]?.split('?')[0]?.split('/')[0];
      return candidate && candidate.length === 11 ? candidate : null;
    }
  } catch (err) {
    console.warn('Could not parse YouTube URL', err);
  }
  return null;
}

/**
 * Generates high-quality YouTube thumbnail preview
 */
export function getYouTubeThumbnailUrl(videoUrl?: string): string | null {
  const videoId = extractYouTubeId(videoUrl);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}

/**
 * Checks if a URL points to a direct video media file (mp4, webm, ogg)
 */
export function isDirectVideoFile(url?: string): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.ogg') || clean.endsWith('.mov');
}

/**
 * Converts any video URL (YouTube, Vimeo, MP4) to a 100% cross-origin compliant embed URL
 * for Vercel, Netlify, and iframes.
 */
export function formatYouTubeEmbedUrl(url?: string): string {
  if (!url) {
    // Reliable, non-restricted tech review embed video
    return 'https://www.youtube-nocookie.com/embed/1kL89_T6VqY?rel=0&modestbranding=1';
  }

  // If it's a direct video file, return as is (for <video> player)
  if (isDirectVideoFile(url)) {
    return url;
  }

  // Handle Vimeo
  if (url.includes('vimeo.com/')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
  }

  const ytId = extractYouTubeId(url);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`;
  }

  return url;
}

