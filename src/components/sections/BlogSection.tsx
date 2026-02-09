/**
 * Blog Section Component - Seoul Dragon City Style
 *
 * Horizontal layout with large featured post + smaller posts
 */

import { Locale } from '@/types';
import { fetchNaverBlogPosts, formatBlogDate, getNaverBlogId } from '@/lib/utils/blog';

interface BlogSectionProps {
  locale: Locale;
}

export default async function BlogSection({ locale }: BlogSectionProps) {
  // Fetch blog posts server-side
  const blogId = getNaverBlogId();
  const { posts } = await fetchNaverBlogPosts(blogId, 4);

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-primary-900 tracking-wide">
              {{ ko: '블로그', en: 'Blog', ja: 'ブログ', zh: '博客' }[locale]}
            </h2>
          </div>
          {blogId && blogId !== 'your_naver_blog_id' && (
            <a
              href={`https://blog.naver.com/${blogId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm text-primary-900 hover:text-accent-500 transition-colors tracking-wide"
            >
              {{ ko: '전체 보기', en: 'View All', ja: 'すべて見る', zh: '查看全部' }[locale]}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}
        </div>

        {/* Blog Grid - Featured + Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Post */}
          {featuredPost && (
            <a
              href={featuredPost.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="aspect-[4/3] relative overflow-hidden mb-6">
                <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-100 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-neutral-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/20 transition-all duration-500" />
              </div>
              <span className="text-xs text-accent-500 tracking-widest uppercase">
                {formatBlogDate(featuredPost.pubDate, locale)}
              </span>
              <h3 className="font-serif text-2xl text-primary-900 mt-3 mb-3 tracking-wide group-hover:text-accent-500 transition-colors line-clamp-2">
                {featuredPost.title}
              </h3>
              <p className="text-neutral-500 text-sm line-clamp-3 leading-relaxed">
                {featuredPost.contentSnippet}
              </p>
            </a>
          )}

          {/* Other Posts */}
          <div className="space-y-6">
            {otherPosts.map((post, index) => (
              <a
                key={index}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-6 pb-6 border-b border-neutral-100 last:border-0"
              >
                {/* Thumbnail */}
                <div className="w-32 h-24 flex-shrink-0 bg-gradient-to-br from-neutral-200 to-neutral-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-neutral-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-accent-500 tracking-widest uppercase">
                    {formatBlogDate(post.pubDate, locale)}
                  </span>
                  <h4 className="font-serif text-lg text-primary-900 mt-1 mb-2 tracking-wide group-hover:text-accent-500 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-neutral-500 text-sm line-clamp-2">
                    {post.contentSnippet}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
