import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ArticleImage from './ArticleImage';

export function WorkflowCover({ profile }) {
    return <div className="article-workflow-cover" aria-label="Luồng bàn giao Sales, garage, kho và kiểm tra">
        <p className="editorial-kicker">Một đơn hàng · Bốn điểm chuyển</p>
        <ol>{profile.workflow.map((step, index) => <li key={step.name}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{step.name}</strong><p>{step.summary}</p></div></li>)}</ol>
        <p className="article-caption">Sơ đồ rút gọn luồng vận hành đề xuất.</p>
    </div>;
}

export function WorkflowExplainer({ steps }) {
    const [selected, setSelected] = useState(1);
    const step = steps[selected];
    return <section className="article-block article-workflow">
        <p className="editorial-kicker">Chọn một điểm để khám phá</p>
        <div className="article-workflow-grid"><div className="article-workflow-stops" role="group" aria-label="Các điểm bàn giao">{steps.map((item, index) => <button key={item.name} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.name}</strong><small>{item.summary}</small></div></button>)}</div>
            <div className="article-workflow-note" aria-live="polite"><p className="editorial-kicker">Điểm {selected + 1} / {step.name}</p><h3>{step.title}</h3><p>{step.copy}</p></div></div>
    </section>;
}

export function EvidenceGallery({ items, disclosure }) {
    const [selected, setSelected] = useState(0);
    const item = items[selected];
    return <section className="article-block article-gallery" aria-label="Bộ ảnh dữ liệu demo">
        <ArticleImage key={item.src} src={item.src} caption={item.title} disclosure={disclosure} evidence />
        <div className="article-gallery-nav"><div><h3>{item.title}</h3><p>{item.caption}</p></div><div className="article-gallery-controls"><button type="button" aria-label="Ảnh trước" onClick={() => setSelected((selected + items.length - 1) % items.length)}><ArrowLeft size={18} /></button><span aria-live="polite">{selected + 1} / {items.length}</span><button type="button" aria-label="Ảnh tiếp" onClick={() => setSelected((selected + 1) % items.length)}><ArrowRight size={18} /></button></div></div>
    </section>;
}

export function EditorialBlock({ name, profile }) {
    if (name === 'workflow') return <WorkflowExplainer steps={profile.workflow} />;
    if (name === 'gallery') return <EvidenceGallery items={profile.gallery} disclosure={profile.imageDisclosure} />;
    if (name === 'facts') return <section className="article-block article-facts"><p className="editorial-kicker">Phạm vi đã dựng để kiểm tra thiết kế</p><dl>{profile.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl><p className="article-caption">{profile.factsSource}</p></section>;
    if (name === 'statement') return <aside className="article-block article-statement"><p>{profile.statement}</p><small>Góc nhìn thiết kế · Mindtransform</small></aside>;
    return null;
}
