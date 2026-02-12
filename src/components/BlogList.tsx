'use client';

import { BlogPost } from '@/types';
import Link from 'next/link';

interface BlogListProps {
    posts: BlogPost[];
    locale: string;
}

export default function BlogList({ posts, locale }: BlogListProps) {
    // Date formatter
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const localeMap: Record<string, string> = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };
        return date.toLocaleDateString(localeMap[locale] || 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {posts.map((post, index) => (
                <Link
                    key={index}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                    {/* Thumbnail area */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {post.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-600 rounded-full">
                            NAVER BLOG
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="flex-1 p-6 flex flex-col">
                        <div className="text-sm text-amber-600 mb-2 font-medium">
                            {formatDate(post.pubDate)}
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
                            {post.contentSnippet}
                        </p>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2 group-hover:gap-3 transition-all">
                            {{ ko: '더 읽기', en: 'Read More', ja: '続きを読む', zh: '阅读更多' }[locale] || 'Read More'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
