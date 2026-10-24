import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { posts as postsService } from '../services/cmsService';
import { getGoogleDriveImageUrl } from '../utils/imageHelper';
import { absoluteArticleImage, formatPostDate, processArticleContent, readingMinutes } from '../utils/article';
import { articleProfile } from '../data/articleProfiles';
import { useModal } from '../context/ModalContext';
import ArticleBody, { articleModel } from '../components/blog/ArticleBody';
import ArticleImage from '../components/blog/ArticleImage';
import { WorkflowCover } from '../components/blog/ArticleBlocks';
import '../styles/editorial.css';

export default function BlogPost() {
    const { slug } = useParams();
    const location = useLocation();
    const { openForm } = useModal();
    const contents = useRef(null);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checked, setChecked] = useState({});
    const profile = articleProfile(post);
    const processedContent = useMemo(() => processArticleContent(post?.content), [post?.content]);
    const model = useMemo(() => articleModel(processedContent, profile), [processedContent, profile]);
    const returnTo = /^\/blog(?:\?|$)/.test(location.state?.blogFrom || '') ? location.state.blogFrom : '/blog';

    useEffect(() => {
        let active = true;
        setLoading(true); setError(null); setPost(null); setChecked({});
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
    }, [loading, processedContent, location.hash]);

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
        <article className="editorial-page" key={slug}>
            <header className="article-hero editorial-container">
                <Link to={returnTo} className="editorial-back"><ArrowLeft size={16} aria-hidden="true" /> Góc vận hành</Link>
                <p className="editorial-kicker">{profile?.label || post.category || 'Góc nhìn'} · Mindtransform</p>
                <div className={profile ? 'article-hero-grid' : 'article-hero-standard'}>
                    <div><h1>{profile ? profile.title.map((line, index) => <React.Fragment key={line}>{index > 0 && <br />}{index === profile.title.length - 1 ? <em>{line}</em> : line}</React.Fragment>) : post.title}</h1>
                        {(profile?.lead || post.summary) && <p className="article-deck">{profile?.lead || post.summary}</p>}
                        <div className="article-meta"><span>{post.author || 'Mindtransform'}</span>{date && <time dateTime={post.date}>{date}</time>}<span>{readingMinutes(processedContent)} phút đọc</span></div>
                        {profile?.disclosure && <p className="article-disclosure">{profile.disclosure}</p>}
                    </div>
                    {profile && <WorkflowCover profile={profile} />}
                </div>
                {!profile && imageUrl && <ArticleImage src={imageUrl} caption={post.title} />}
            </header>
            {model.headings.length > 0 && <div className="article-contents-wrap"><details ref={contents} className="article-contents editorial-container"><summary>Trong bài <span>{model.headings.length} phần <ChevronDown size={16} aria-hidden="true" /></span></summary><nav aria-label="Mục lục bài viết">{model.headings.map((heading, index) => <a key={heading.id} href={`#${heading.id}`} className={heading.level === 3 ? 'article-subheading' : ''} onClick={() => { if (contents.current) contents.current.open = false; }}><span>{String(index + 1).padStart(2, '0')}</span>{heading.text}</a>)}</nav></details></div>}
            <ArticleBody model={model} profile={profile} />
            <section className="article-next editorial-container" aria-labelledby="article-next-title"><p className="editorial-kicker">Một việc để thử sau khi đọc</p><h2 id="article-next-title">{profile?.nextTitle || 'Chọn một điểm đang vướng trong vận hành.'}</h2><p>{profile?.nextCopy || 'Bắt đầu từ một quy trình cụ thể, cùng đội ngũ nhìn hiện trạng và thống nhất cách đo trước khi chọn giải pháp.'}</p>
                {profile?.checklist && <details className="article-checklist"><summary>Mở 3 câu hỏi kiểm tra <ChevronDown size={17} aria-hidden="true" /></summary><div>{profile.checklist.map((item, index) => <label key={item}><input type="checkbox" checked={!!checked[index]} onChange={event => setChecked(previous => ({ ...previous, [index]: event.target.checked }))} />{item}</label>)}<p aria-live="polite">{Object.values(checked).filter(Boolean).length}/3 câu đã kiểm tra</p></div></details>}
                <div className="article-next-actions"><button type="button" className="editorial-button" onClick={openForm}>Cùng Mindtransform đọc vị điểm kẹt <ArrowRight size={17} aria-hidden="true" /></button><Link to={returnTo}>Đọc bài khác</Link></div>
            </section>
        </article>
    </>;
}
