import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ArticleImage from './ArticleImage';

export function WorkflowCover({ profile }) {
    return <div className="article-workflow-cover" aria-label="Sơ đồ quy trình">
        <p className="editorial-kicker">{profile.document ? 'Tổng quan quy trình' : 'Một đơn hàng · Bốn điểm chuyển'}</p>
        <ol>{profile.workflow.map((step, index) => <li key={step.name}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{step.name}</strong><p>{step.summary}</p></div></li>)}</ol>
        <p className="article-caption">Sơ đồ rút gọn luồng vận hành đề xuất.</p>
    </div>;
}

export function WorkflowExplainer({ steps }) {
    const [selected, setSelected] = useState(Math.min(1, steps.length - 1));
    const active = Math.max(0,Math.min(selected,steps.length - 1));
    const step = steps[active];
    if (!step) return <p className="article-caption">Chưa có bước quy trình.</p>;
    return <section className="article-block article-workflow">
        <p className="editorial-kicker">Chọn một điểm để khám phá</p>
        <div className="article-workflow-grid"><div className="article-workflow-stops" role="group" aria-label="Các điểm bàn giao">{steps.map((item, index) => <button key={index} type="button" aria-pressed={index === active} onClick={() => setSelected(index)}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.name}</strong><small>{item.summary}</small></div></button>)}</div>
            <div className="article-workflow-note" aria-live="polite"><p className="editorial-kicker">Điểm {active + 1} / {step.name}</p><h3>{step.title}</h3><p>{step.copy}</p></div></div>
    </section>;
}

export function EvidenceGallery({ items, disclosure, evidence = true, label = 'Bộ ảnh bài viết' }) {
    const [selected, setSelected] = useState(0);
    const active = Math.max(0,Math.min(selected,items.length - 1));
    const item = items[active];
    if (!item) return <p className="article-caption">Chưa có ảnh trong bộ ảnh.</p>;
    return <section className="article-block article-gallery" aria-label={label}>
        <ArticleImage key={item.src} src={item.src} caption={item.title} disclosure={disclosure} evidence={evidence} />
        <div className="article-gallery-nav"><div><h3>{item.title}</h3><p>{item.caption}</p></div><div className="article-gallery-controls"><button type="button" aria-label="Ảnh trước" onClick={() => setSelected((active + items.length - 1) % items.length)}><ArrowLeft size={18} /></button><span aria-live="polite">{active + 1} / {items.length}</span><button type="button" aria-label="Ảnh tiếp" onClick={() => setSelected((active + 1) % items.length)}><ArrowRight size={18} /></button></div></div>
    </section>;
}

function ReaderChecklist({ block }) {
    const [checked,setChecked] = useState({});
    return <div className="article-reader-checklist">{block.items.map((item,index) => <label key={index}><input type="checkbox" checked={!!checked[index]} onChange={event => setChecked(previous => ({...previous,[index]:event.target.checked}))} />{item}</label>)}<p aria-live="polite">{Object.values(checked).filter(Boolean).length}/{block.items.length} mục đã kiểm tra</p></div>;
}

function Comparison({ block }) {
    const [after,setAfter] = useState(false);
    return <><div className="article-comparison-controls" role="group" aria-label={block.title || 'Chọn cách so sánh'}><button type="button" aria-pressed={!after} onClick={() => setAfter(false)}>{block.beforeLabel}</button><button type="button" aria-pressed={after} onClick={() => setAfter(true)}>{block.afterLabel}</button></div><div className="article-comparison-grid" aria-live="polite">{block.items.map((item,index) => <div key={index}><h3>{item.name}</h3><p>{after ? item.after : item.before}</p></div>)}</div>{block.source && <p className="article-caption">{block.source}</p>}</>;
}

export function StructuredBlock({ block, headingId }) {
    let content;
    if (block.type === 'image') return <div className={`article-block article-image-width-${block.width}`}><ArticleImage src={block.src} alt={block.alt} caption={block.caption} disclosure={block.source} evidence={block.evidence} /></div>;
    if (block.type === 'quote') return <aside className="article-block article-statement"><p>{block.text}</p>{block.attribution && <small>{block.attribution}</small>}</aside>;
    if (block.type === 'workflow') content = <WorkflowExplainer steps={block.steps} />;
    if (block.type === 'gallery') content = <EvidenceGallery items={block.images} disclosure={block.disclosure} evidence={block.evidence} label={block.title || 'Bộ ảnh bài viết'} />;
    if (block.type === 'stats') content = <div className="article-facts"><dl>{block.items.map((item,index) => <div key={index}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl><p className="article-caption">{block.source}</p></div>;
    if (block.type === 'timeline') content = <ol className="article-timeline">{block.events.map((event,index) => <li key={index}><span>{event.label}</span><h3>{event.title}</h3>{event.body && <p>{event.body}</p>}</li>)}</ol>;
    if (block.type === 'comparison') content = <Comparison block={block} />;
    if (block.type === 'checklist') content = <ReaderChecklist block={block} />;
    return <section className={`article-block article-structured-${block.type}`}>{block.title && <h2 id={headingId} tabIndex={-1}>{block.title}</h2>}{content}</section>;
}

export function EditorialBlock({ name, profile }) {
    if (name === 'workflow') return <WorkflowExplainer steps={profile.workflow} />;
    if (name === 'gallery') return <EvidenceGallery items={profile.gallery} disclosure={profile.imageDisclosure} />;
    if (name === 'facts') return <section className="article-block article-facts"><p className="editorial-kicker">Phạm vi đã dựng để kiểm tra thiết kế</p><dl>{profile.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl><p className="article-caption">{profile.factsSource}</p></section>;
    if (name === 'statement') return <aside className="article-block article-statement"><p>{profile.statement}</p><small>Góc nhìn thiết kế · Mindtransform</small></aside>;
    return null;
}
