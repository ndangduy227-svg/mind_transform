import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Search } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { posts as postsService } from '../services/cmsService';
import { getGoogleDriveImageUrl } from '../utils/imageHelper';
import { formatPostDate, readingMinutes, searchText } from '../utils/article';
import { articleProfile } from '../data/articleProfiles';
import { WorkflowCover } from '../components/blog/ArticleBlocks';
import '../styles/editorial.css';

const CATEGORY_LABELS = { Strategy:'Chiến lược & tư duy', Technology:'Công nghệ & giải pháp', Methodology:'Phương pháp vận hành', Data:'Dữ liệu & đo lường', 'Case Study':'Case study' };

function PostMeta({ post }) {
    const date = formatPostDate(post.date);
    return <div className="article-meta">{date && <time dateTime={post.date}>{date}</time>}<span>{readingMinutes(post.content)} phút đọc</span></div>;
}

export default function Blog() {
    const [posts, setPosts] = useState(() => postsService.getCached());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const query = params.get('q') || '';
    const category = params.get('category') || '';
    useEffect(() => {
        let active = true;
        postsService.getAll().then(data => { if (active) { setPosts(data); setLoading(false); } })
            .catch(() => { if (active) { setError(true); setLoading(false); } });
        return () => { active = false; };
    }, []);
    const updateFilter = (key, value) => {
        const next = new URLSearchParams(params);
        if (value) next.set(key,value); else next.delete(key);
        setParams(next, { replace: true });
    };
    const term = query.trim() ? searchText(query) : '';
    const filtered = posts.filter(post => (!category || post.category === category) && (!term || searchText(`${post.title || ''} ${post.summary || ''}`).includes(term)));
    const [featured, ...remaining] = filtered;
    const profile = articleProfile(featured);
    const linkState = { blogFrom: location.pathname + location.search };
    const categories = [...new Set(posts.map(post => post.category).filter(Boolean))];
    const featuredImage = featured && getGoogleDriveImageUrl(featured.cover_image || featured.image);
    return <>
        <Helmet><title>Góc vận hành | Mindtransform</title><meta name="description" content="Case study, sơ đồ quy trình và bài học giúp doanh nghiệp nhỏ nhìn rõ điểm kẹt, bắt đầu từ một việc cụ thể." /><link rel="canonical" href="https://mind-transform.vercel.app/blog" /><meta property="og:title" content="Góc vận hành | Mindtransform" /><meta property="og:description" content="Hiểu đúng vấn đề. Gỡ một điểm cụ thể. Case study, quy trình và bài học từ Mindtransform." /><meta property="og:url" content="https://mind-transform.vercel.app/blog" /><meta property="og:type" content="website" /><meta name="twitter:card" content="summary_large_image" /></Helmet>
        <div className="editorial-page"><div className="editorial-container">
            <header className="blog-intro"><p className="editorial-kicker">Góc vận hành · Mindtransform</p><h1>Bắt đầu từ<br />một điểm kẹt.</h1><p>Nhìn rõ vấn đề, hiểu cách gỡ và chọn một việc để thử. Những góc nhìn về vận hành, qua câu chuyện và sơ đồ cụ thể.</p></header>
            <div className="blog-controls"><label className="blog-search"><Search size={20} aria-hidden="true" /><span className="sr-only">Tìm bài viết</span><input type="search" value={query} onChange={event => updateFilter('q',event.target.value)} placeholder="Tìm vấn đề: bàn giao, tồn kho, báo cáo..." /></label>
                {categories.length > 1 && <div className="blog-topics" role="group" aria-label="Chủ đề bài viết"><button type="button" aria-pressed={!category} onClick={() => updateFilter('category','')}>Tất cả</button>{categories.map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => updateFilter('category',value)}>{CATEGORY_LABELS[value] || value}</button>)}</div>}
            </div>
            {loading && !featured ? <p className="blog-no-results" role="status">Đang tải bài viết...</p> : error && !posts.length ? <p className="blog-no-results" role="alert">Không thể tải bài viết. Vui lòng tải lại trang để thử lại.</p> : !featured ? <div className="blog-no-results" role="status"><p>Không tìm thấy bài viết phù hợp.</p><button type="button" className="editorial-button" onClick={() => setParams({})}>Xem tất cả bài viết</button></div> : <>
                <article className="blog-feature"><div><p className="editorial-kicker">{profile?.label || CATEGORY_LABELS[featured.category] || featured.category || 'Góc nhìn'} · {profile?.format === 'standard' ? 'Bài ngắn' : profile?.format === 'explainer' ? 'Visual explainer' : 'Longform'}</p><h2><Link to={`/blog/${featured.slug}`} state={linkState}>{featured.title}</Link></h2><p>{profile?.lead || featured.summary}</p><PostMeta post={featured} />{profile?.disclosure && <p className="article-caption">{profile.disclosure}</p>}<Link to={`/blog/${featured.slug}`} state={linkState} className="editorial-button">Đọc câu chuyện <ArrowRight size={17} aria-hidden="true" /></Link></div>{profile?.heroMode === 'workflow' && profile.workflow.length > 0 ? <WorkflowCover profile={profile} /> : featuredImage ? <Link to={`/blog/${featured.slug}`} state={linkState} aria-label={`Đọc ${featured.title}`}><img src={featuredImage} alt="" className="blog-thumbnail" decoding="async" /></Link> : null}</article>
                {remaining.length > 0 && <div className="blog-grid">{remaining.map(post => {
                    const image = getGoogleDriveImageUrl(post.cover_image || post.image);
                    return <article key={post.slug} className="blog-card">{image && <Link to={`/blog/${post.slug}`} state={linkState} aria-label={`Đọc ${post.title}`}><img src={image} alt="" className="blog-thumbnail" loading="lazy" decoding="async" /></Link>}<p className="editorial-kicker">{articleProfile(post)?.label || CATEGORY_LABELS[post.category] || post.category || 'Góc nhìn'}</p><h2><Link to={`/blog/${post.slug}`} state={linkState}>{post.title}</Link></h2>{post.summary && <p>{post.summary}</p>}<PostMeta post={post} /></article>;
                })}</div>}
            </>}
        </div></div>
    </>;
}
