import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Loader2, List } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Markdown from 'react-markdown';
import { getGoogleDriveImageUrl } from '../utils/imageHelper';
import SidebarCTA from '../components/SidebarCTA';

// URL Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTOHDWp8w7M5RtSXxA_lqkQTA_1pqGw_xyO_bPkj0I32P7ck5U5GGe4fBE77ZAM9xEhg/exec";

export default function BlogPost() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);

    useEffect(() => {
        setLoading(true);
        fetch(SCRIPT_URL)
            .then(res => res.json())
            .then(data => {
                const foundPost = data.find(p => p.slug === slug);
                if (foundPost) {
                    setPost(foundPost);

                    // Extract headings for TOC with numbering logic
                    const lines = foundPost.content.split('\n');
                    let h1Count = 0;
                    let h2Count = 0;
                    let h3Count = 0;

                    const extractedHeadings = lines
                        .filter(line => line.startsWith('#'))
                        .map(line => {
                            const level = line.match(/^#+/)[0].length;
                            const text = line.replace(/^#+\s+/, '');
                            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

                            let number = '';
                            if (level === 1) {
                                h1Count++;
                                h2Count = 0;
                                h3Count = 0;
                                number = `${h1Count}.`;
                            } else if (level === 2) {
                                h2Count++;
                                h3Count = 0;
                                number = `${h1Count}.${h2Count}`;
                            } else if (level === 3) {
                                h3Count++;
                                number = `${h1Count}.${h2Count}.${h3Count}`;
                            }

                            return { level, text, id, number };
                        });
                    setHeadings(extractedHeadings);
                } else {
                    setError("Bài viết không tồn tại.");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching post:", err);
                setError("Không thể tải bài viết.");
                setLoading(false);
            });
    }, [slug]);

    // Custom Image Syntax Parser: [Image: Link; Caption]
    // Note: We process this before passing to Markdown
    const processContent = (content) => {
        if (!content) return '';
        return content.replace(/\[Image:\s*([^;\]]+)(?:;\s*([^\]]+))?\]/g, (match, url, caption) => {
            // We replace with a special marker that we can handle in Markdown components or just standard markdown image with caption
            // Let's use standard markdown image syntax: ![caption](url)
            // And then in the img component, we render the figure.
            return `![${caption || ''}](${url.trim()})`;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
                <p className="text-slate-400 mb-8">{error || "Không tìm thấy bài viết."}</p>
                <Link to="/blog" className="text-teal-400 hover:text-teal-300 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Quay lại Blog
                </Link>
            </div>
        );
    }

    const imageUrl = getGoogleDriveImageUrl(post.image);
    const processedContent = processContent(post.content);

    return (
        <>
            <Helmet>
                <title>{post.title} | Mind.Transform Blog</title>
                <meta name="description" content={post.summary} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.summary} />
                {imageUrl && <meta property="og:image" content={imageUrl} />}
            </Helmet>

            <article className="min-h-screen py-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
                    {/* Main Content */}
                    <div className="min-w-0">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Quay lại Blog
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                                <span className="px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20">
                                    {post.category}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(post.date).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {post.author}
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
                                {post.title}
                            </h1>

                            {imageUrl && (
                                <div className="rounded-2xl overflow-hidden mb-10 border border-white/10">
                                    <img src={imageUrl} alt={post.title} className="w-full h-auto object-cover" />
                                </div>
                            )}

                            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-teal-400 hover:prose-a:text-teal-300 prose-strong:text-white prose-img:rounded-xl">
                                <Markdown
                                    components={{
                                        img: ({ node, ...props }) => {
                                            const realSrc = getGoogleDriveImageUrl(props.src);
                                            return (
                                                <figure className="my-8">
                                                    <img {...props} src={realSrc} alt={props.alt} className="w-full rounded-xl border border-white/10" />
                                                    {props.alt && <figcaption className="text-center text-sm text-slate-400 mt-2 italic">{props.alt}</figcaption>}
                                                </figure>
                                            );
                                        },
                                        h1: ({ node, ...props }) => {
                                            const id = props.children.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                                            return <h1 id={id} {...props} />;
                                        },
                                        h2: ({ node, ...props }) => {
                                            const id = props.children.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                                            return <h2 id={id} {...props} />;
                                        },
                                        h3: ({ node, ...props }) => {
                                            const id = props.children.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                                            return <h3 id={id} {...props} />;
                                        }
                                    }}
                                >
                                    {processedContent}
                                </Markdown>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar / Table of Contents */}
                    <div className="hidden lg:block space-y-8">
                        {/* Table of Contents */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
                            <div className="flex items-center gap-2 mb-4 text-teal-400 font-bold">
                                <List className="w-5 h-5" />
                                <span>Mục lục</span>
                            </div>
                            <nav className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {headings.length === 0 ? (
                                    <p className="text-sm text-slate-500">Bài viết không có mục lục.</p>
                                ) : (
                                    headings.map((heading, index) => (
                                        <a
                                            key={index}
                                            href={`#${heading.id}`}
                                            className={`block text-sm transition-colors hover:text-teal-400 ${heading.level === 1 ? 'text-white font-medium' :
                                                    heading.level === 2 ? 'text-slate-300 pl-4' :
                                                        'text-slate-400 pl-8'
                                                }`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            <span className="mr-2 opacity-50">{heading.number}</span>
                                            {heading.text}
                                        </a>
                                    ))
                                )}
                            </nav>
                        </div>

                        {/* Sidebar CTA */}
                        <div className="sticky top-[calc(24px+60vh+32px)]">
                            <SidebarCTA />
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
}
