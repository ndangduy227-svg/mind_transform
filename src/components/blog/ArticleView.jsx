import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { articleProfile } from '../../data/articleProfiles';
import { formatPostDate, readingMinutes, processArticleContent } from '../../utils/article';
import { getGoogleDriveImageUrl } from '../../utils/imageHelper';
import ArticleBody, { articleModel } from './ArticleBody';
import ArticleImage from './ArticleImage';
import { WorkflowCover } from './ArticleBlocks';
import '../../styles/editorial.css';

export default function ArticleView({ post, returnTo = '/blog', onContact, preview = false }) {
    const profile = articleProfile(post);
    const doc = profile?.document;
    const content = useMemo(() => processArticleContent(post.content),[post.content]);
    const model = useMemo(() => articleModel(content,profile),[content]);
    const contents = useRef(null);
    const [checked,setChecked] = useState({});
    const heroMode = doc ? doc.hero.coverMode : profile ? 'workflow' : 'image';
    const coverWorkflow = heroMode === 'workflow' && profile?.workflow?.length > 0;
    const image = getGoogleDriveImageUrl(post.cover_image || post.image);
    const title = profile?.title?.length ? profile.title : [post.title || 'Tiêu đề bài viết'];
    const date = formatPostDate(post.date);
    const cta = doc?.cta;
    return <article className={`editorial-page editorial-format-${doc?.format || 'longform'} editorial-theme-${doc?.appearance.theme || 'paper'} editorial-width-${doc?.appearance.width || 'comfortable'}`}>
        <header className="article-hero editorial-container">
            {preview ? <span className="editorial-back">Bản xem trước · chưa lưu / xuất bản</span> : <Link to={returnTo} className="editorial-back"><ArrowLeft size={16} aria-hidden="true" /> Góc vận hành</Link>}
            <p className="editorial-kicker">{profile?.label || post.category || 'Góc nhìn'} · Mindtransform</p>
            <div className={coverWorkflow ? 'article-hero-grid' : 'article-hero-standard'}>
                <div><h1>{title.map((line,index) => <React.Fragment key={index}>{index > 0 && <br />}{index > 0 && index === title.length - 1 ? <em>{line}</em> : line}</React.Fragment>)}</h1>
                    {(profile?.lead || post.summary) && <p className="article-deck">{profile?.lead || post.summary}</p>}
                    <div className="article-meta"><span>{post.author || 'Mindtransform'}</span>{date && <time dateTime={post.date}>{date}</time>}<span>{readingMinutes(content)} phút đọc</span></div>
                    {profile?.disclosure && <p className="article-disclosure">{profile.disclosure}</p>}
                </div>
                {coverWorkflow && <WorkflowCover profile={profile} />}
            </div>
            {heroMode === 'image' && image && <ArticleImage src={image} caption={profile?.coverCaption || post.title} disclosure={profile?.disclosure} />}
        </header>
        {doc?.appearance.showContents !== false && model.headings.length > 0 && <div className="article-contents-wrap"><details ref={contents} className="article-contents editorial-container"><summary>Trong bài <span>{model.headings.length} phần <ChevronDown size={16} aria-hidden="true" /></span></summary><nav aria-label="Mục lục bài viết">{model.headings.map((heading,index) => <a key={heading.id} href={`#${heading.id}`} className={heading.level === 3 ? 'article-subheading' : ''} onClick={() => { if(contents.current) contents.current.open=false; }}><span>{String(index+1).padStart(2,'0')}</span>{heading.text}</a>)}</nav></details></div>}
        <ArticleBody model={model} profile={profile} />
        {cta?.enabled !== false && <section className="article-next editorial-container" aria-labelledby="article-next-title"><p className="editorial-kicker">Một việc để thử sau khi đọc</p><h2 id="article-next-title">{profile?.nextTitle || 'Chọn một điểm đang vướng trong vận hành.'}</h2><p>{profile?.nextCopy || 'Bắt đầu từ một quy trình cụ thể, cùng đội ngũ nhìn hiện trạng và thống nhất cách đo trước khi chọn giải pháp.'}</p>
            {profile?.checklist && <details className="article-checklist"><summary>Mở 3 câu hỏi kiểm tra <ChevronDown size={17} aria-hidden="true" /></summary><div>{profile.checklist.map((item,index) => <label key={item}><input type="checkbox" checked={!!checked[index]} onChange={event => setChecked(previous => ({...previous,[index]:event.target.checked}))} />{item}</label>)}<p aria-live="polite">{Object.values(checked).filter(Boolean).length}/3 câu đã kiểm tra</p></div></details>}
            <div className="article-next-actions">{cta?.action === 'link' ? <a className="editorial-button" href={cta.url || undefined} onClick={event => { if(preview) event.preventDefault(); }}>{cta.label || 'Tìm hiểu thêm'}<ArrowRight size={17} aria-hidden="true" /></a> : <button type="button" className="editorial-button" disabled={preview} onClick={onContact}>{cta?.label || 'Cùng Mindtransform đọc vị điểm kẹt'}<ArrowRight size={17} aria-hidden="true" /></button>}{!preview && <Link to={returnTo}>Đọc bài khác</Link>}</div>
        </section>}
    </article>;
}
