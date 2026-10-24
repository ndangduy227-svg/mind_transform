import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { posts as postsService } from '../services/cmsService';
import { getGoogleDriveImageUrl } from '../utils/imageHelper';
import { absoluteArticleImage, formatPostDate } from '../utils/article';
import { useModal } from '../context/ModalContext';
import ArticleView from '../components/blog/ArticleView';

export default function BlogPost() {
    const { slug } = useParams();
    const location = useLocation();
    const { openForm } = useModal();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const returnTo = /^\/blog(?:\?|$)/.test(location.state?.blogFrom || '') ? location.state.blogFrom : '/blog';

    useEffect(() => {
        let active = true;
        setLoading(true); setError(null); setPost(null);
        postsService.getBySlug(slug).then(found => {
            if (!active) return;
            setPost(found);
            if (!found) setError('Bài viết không tồn tại.');
            setLoading(false);
        }).catch(() => {
            if (!active) return;
            setError('Không thể tải bài viết.'); setLoading(false);
        });
        return () => { active = false; };
    }, [slug]);

    useEffect(() => {
        if (loading || !location.hash) return;
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        document.getElementById(id)?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    }, [loading, post?.content, location.hash]);

    if (loading) return <div className="editorial-page editorial-loading" role="status"><Loader2 className="animate-spin" aria-hidden="true" /> Đang tải bài viết...</div>;
    if (error || !post) return <div className="editorial-page editorial-loading"><Helmet><meta name="robots" content="noindex" /></Helmet><h1>{error || 'Không tìm thấy bài viết.'}</h1><Link to={returnTo}>Quay lại Blog</Link></div>;

    const imageUrl = getGoogleDriveImageUrl(post.cover_image || post.image);
    const canonical = `https://mind-transform.vercel.app/blog/${post.slug}`;
    const socialImage = absoluteArticleImage(imageUrl, canonical);
    const date = formatPostDate(post.date);
    return <>
        <Helmet>
            <title>{post.title} | Mindtransform</title>
            <meta name="description" content={post.summary || ''} />
            <link rel="canonical" href={canonical} />
            <meta property="og:title" content={post.title} /><meta property="og:description" content={post.summary || ''} />
            <meta property="og:url" content={canonical} /><meta property="og:type" content="article" />
            {socialImage && <meta property="og:image" content={socialImage} />}
            <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={post.title} />
            <meta name="twitter:description" content={post.summary || ''} />
            {socialImage && <meta name="twitter:image" content={socialImage} />}
            <script type="application/ld+json">{JSON.stringify({
                '@context': 'https://schema.org', '@type': 'Article', headline: post.title,
                description: post.summary || '', image: socialImage || undefined,
                author: { '@type': 'Organization', name: post.author || 'Mindtransform' },
                publisher: { '@type': 'Organization', name: 'Mindtransform' },
                datePublished: date ? post.date : undefined, mainEntityOfPage: canonical,
            }).replace(/</g, '\\u003c')}</script>
        </Helmet>
        <ArticleView key={slug} post={post} returnTo={returnTo} onContact={openForm} />
    </>;
}
