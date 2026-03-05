/**
 * Blog/RSS Feed Utilities - Edge Runtime Compatible
 *
 * Handles fetching and parsing Naver blog RSS feeds.
 * Uses native fetch + regex-based XML parsing (no rss-parser dependency).
 */

import { BlogPost, BlogFeedResponse } from '@/types';

/**
 * Naver Blog RSS URL format
 * Replace {blogId} with the actual blog ID
 */
const NAVER_RSS_URL = 'https://rss.blog.naver.com/{blogId}.xml';

/**
 * Fallback blog posts for demo/development
 * Used when Naver blog is not configured or unavailable
 */
const FALLBACK_POSTS: BlogPost[] = [
  {
    title: '호텔 숙박 시 알아두면 좋은 팁 10가지',
    link: '#',
    pubDate: new Date().toISOString(),
    contentSnippet:
      '호텔 투숙 시 체크인부터 체크아웃까지 유용한 정보를 알려드립니다. 더 나은 숙박 경험을 위한 꿀팁을 확인하세요.',
  },
  {
    title: '서울 강남 맛집 추천: 호텔 근처 레스토랑',
    link: '#',
    pubDate: new Date(Date.now() - 86400000).toISOString(),
    contentSnippet:
      '호텔 근처에서 즐길 수 있는 맛집을 소개합니다. 한식부터 양식까지 다양한 선택지를 확인해보세요.',
  },
  {
    title: '비즈니스 출장객을 위한 호텔 서비스 안내',
    link: '#',
    pubDate: new Date(Date.now() - 172800000).toISOString(),
    contentSnippet:
      '비즈니스 출장 시 필요한 호텔 서비스를 안내합니다. 미팅룸, 비즈니스 센터 등 다양한 편의시설을 이용하세요.',
  },
  {
    title: '가족 여행객을 위한 패밀리 객실 소개',
    link: '#',
    pubDate: new Date(Date.now() - 259200000).toISOString(),
    contentSnippet:
      '가족 단위 투숙객을 위한 넓은 패밀리 객실을 소개합니다. 아이들과 함께하는 편안한 여행을 계획해보세요.',
  },
  {
    title: '호텔 로얄 스위트룸 투숙 후기',
    link: '#',
    pubDate: new Date(Date.now() - 345600000).toISOString(),
    contentSnippet:
      '최고급 로얄 스위트룸의 실제 투숙 경험을 공유합니다. 럭셔리한 공간과 서비스를 만나보세요.',
  },
];

/**
 * Extract value from an XML tag (supports CDATA and plain text)
 */
function extractTag(xml: string, tagName: string): string | null {
  // CDATA format: <tag><![CDATA[value]]></tag>
  const cdataRegex = new RegExp(
    `<${tagName}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`, 'i'
  );
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Plain format: <tag>value</tag>
  const plainRegex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'i');
  const plainMatch = xml.match(plainRegex);
  if (plainMatch) return plainMatch[1].trim();

  return null;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Parse RSS XML into BlogPost array (Edge-compatible, no DOMParser)
 */
function parseRssXml(xml: string, limit: number): BlogPost[] {
  const items: BlogPost[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const itemXml = match[1];

    const title = extractTag(itemXml, 'title') || 'Untitled';
    const link = extractTag(itemXml, 'link') || '#';
    const pubDate = extractTag(itemXml, 'pubDate') || new Date().toISOString();
    const content = extractTag(itemXml, 'description') || '';

    items.push({
      title: decodeHtmlEntities(title),
      link,
      pubDate,
      content,
      contentSnippet: extractSnippet(content),
      thumbnail: extractThumbnail(content),
    });
  }

  return items;
}

/**
 * Fetch and parse Naver blog RSS feed (Edge-compatible)
 */
export async function fetchNaverBlogPosts(
  blogId?: string,
  limit = 5
): Promise<BlogFeedResponse> {
  // If no blog ID, return fallback posts
  if (!blogId || blogId === 'your_naver_blog_id') {
    console.log('Using fallback blog posts (Naver blog not configured)');
    return {
      success: true,
      posts: FALLBACK_POSTS.slice(0, limit),
    };
  }

  try {
    const rssUrl = NAVER_RSS_URL.replace('{blogId}', blogId);
    console.log(`Fetching Naver blog RSS: ${rssUrl}`);

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HotelWebsite/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xmlText = await response.text();
    const posts = parseRssXml(xmlText, limit);

    console.log(`Fetched ${posts.length} blog posts`);

    return {
      success: true,
      posts,
    };
  } catch (error) {
    console.error('Failed to fetch Naver blog RSS:', error);

    // Return fallback posts on error
    return {
      success: false,
      posts: FALLBACK_POSTS.slice(0, limit),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract a text snippet from HTML content
 */
function extractSnippet(html: string, maxLength = 150): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  // Decode HTML entities
  const decoded = decodeHtmlEntities(text);
  // Trim and truncate
  const trimmed = decoded.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + '...';
}

/**
 * Extract thumbnail URL from HTML content
 */
function extractThumbnail(html: string): string | undefined {
  // Try to find an image in the content
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : undefined;
}

/**
 * Format blog post date
 */
export function formatBlogDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const todayText: Record<string, string> = { ko: '오늘', en: 'Today', ja: '今日', zh: '今天' };
  const yesterdayText: Record<string, string> = { ko: '어제', en: 'Yesterday', ja: '昨日', zh: '昨天' };
  const daysAgoText: Record<string, (n: number) => string> = {
    ko: (n) => `${n}일 전`,
    en: (n) => `${n} days ago`,
    ja: (n) => `${n}日前`,
    zh: (n) => `${n}天前`,
  };

  // Within 7 days, show relative time
  if (diffDays === 0) {
    return todayText[locale] || todayText.en;
  }
  if (diffDays === 1) {
    return yesterdayText[locale] || yesterdayText.en;
  }
  if (diffDays < 7) {
    return (daysAgoText[locale] || daysAgoText.en)(diffDays);
  }

  // Otherwise, show formatted date
  const localeMap: Record<string, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };
  return date.toLocaleDateString(localeMap[locale] || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get Naver blog ID from environment
 */
export function getNaverBlogId(): string | undefined {
  return process.env.NEXT_PUBLIC_NAVER_BLOG_ID;
}

/**
 * Check if Naver blog is configured
 */
export function isNaverBlogConfigured(): boolean {
  const blogId = getNaverBlogId();
  return !!blogId && blogId !== 'your_naver_blog_id';
}
