import React, { useRef, useState, useId } from 'react';
import { Expand, X } from 'lucide-react';
import { defaultUrlTransform } from 'react-markdown';
import { getGoogleDriveImageUrl } from '../../utils/imageHelper';

export default function ArticleImage({ src, caption, disclosure, evidence = false }) {
    const dialog = useRef(null);
    const trigger = useRef(null);
    const id = useId();
    const [failed, setFailed] = useState(false);
    const safeSource = defaultUrlTransform(String(src || ''));
    const imageUrl = safeSource ? getGoogleDriveImageUrl(safeSource) : '';
    const close = () => {
        if (dialog.current?.close) dialog.current.close();
        else dialog.current?.removeAttribute('open');
        trigger.current?.focus();
    };
    return <figure className={`article-media ${evidence ? 'article-evidence' : ''}`}>
        {!imageUrl || failed ? <p className="article-image-error" role="status">Không tải được ảnh{caption ? `: ${caption}` : '.'}</p> : <>
            <button ref={trigger} type="button" className="article-image-button" aria-label={`Mở ảnh: ${caption || 'Minh họa bài viết'}`} onClick={() => {
                if (dialog.current?.showModal) dialog.current.showModal();
                else dialog.current?.setAttribute('open', '');
            }}>
                <span className="article-media-window"><img src={imageUrl} alt={caption || ''} loading="lazy" decoding="async" onError={() => setFailed(true)} /></span>
                <span className="article-zoom-label"><Expand size={15} aria-hidden="true" /> Xem ảnh lớn</span>
            </button>
            <dialog ref={dialog} className="article-lightbox" aria-labelledby={id} onClick={event => { if (event.target === dialog.current) close(); }}>
                <div className="article-lightbox-head"><p id={id}>{caption || 'Minh họa bài viết'}</p><button type="button" onClick={close} aria-label="Đóng ảnh"><X size={22} /></button></div>
                <img src={imageUrl} alt={caption || 'Minh họa bài viết'} loading="lazy" />
                {disclosure && <p className="article-caption">{disclosure}</p>}
            </dialog>
        </>}
        {(caption || disclosure) && <figcaption className="article-caption">{caption && <span>{caption}</span>}{disclosure && <span>{disclosure}</span>}</figcaption>}
    </figure>;
}
