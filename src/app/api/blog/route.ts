/**
 * Blog API Route
 *
 * Fetches blog posts from Naver RSS feed.
 *
 * GET /api/blog - Get latest blog posts
 * GET /api/blog?limit=5 - Limit number of posts
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchNaverBlogPosts, getNaverBlogId } from '@/lib/utils/blog';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET handler - Fetch blog posts from Naver RSS
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const blogId = getNaverBlogId();
    const result = await fetchNaverBlogPosts(blogId, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Blog API Error:', error);
    return NextResponse.json(
      {
        success: false,
        posts: [],
        error: 'Failed to fetch blog posts',
      },
      { status: 500 }
    );
  }
}
