import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Pencil, Loader2, Download, Upload } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { adminPosts } from '../../services/cmsAdminService';
import { createDocument, decodeDocument, documentIssues, FORMATS, postPayload } from '../../utils/editorialDocument';
import { headingSlug } from '../../utils/article';
import { STATIC_POSTS } from '../../data/staticPosts';
import ArticleBlockEditor, { ConfigField, ConfigImage } from '../../components/admin/ArticleBlockEditor';
import ArticleView from '../../components/blog/ArticleView';
import '../../styles/article-editor.css';

const newPost = () => ({ title:'',slug:'',summary:'',cover_image:'',category:'Strategy',author:'Mindtransform',status:'Draft',date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date()) });

export default function PostEditor() {
    const { slug } = useParams();
    const isNew = slug === 'new';
    const navigate = useNavigate();
    const [form,setForm] = useState(newPost);
    const [doc,setDoc] = useState(createDocument);
    const [loading,setLoading] = useState(!isNew);
    const [saving,setSaving] = useState(false);
    const [loadError,setLoadError] = useState('');
    const [errors,setErrors] = useState([]);
    const [dirty,setDirty] = useState(false);
    const [preview,setPreview] = useState(false);
    const [phone,setPhone] = useState(false);
    const [uploads,setUploads] = useState({});
    const [beforeImport,setBeforeImport] = useState(null);
    const docRef = useRef(doc);
    docRef.current=doc;
    const importInput = useRef(null);
    const uploadsBusy = Object.values(uploads).some(Boolean);
    useEffect(() => {
        let active = true;
        setLoading(!isNew);setLoadError('');setErrors([]);setDirty(false);setPreview(false);setUploads({});setBeforeImport(null);
        if(isNew) {setForm(newPost());setDoc(createDocument());return () => {active=false;};}
        adminPosts.getBySlug(slug).then(post => {
            if(!active)return;
            if(!post) {setLoadError('Không tìm thấy bài viết.');return;}
            const decoded=decodeDocument(post.content);
            if(['invalid','unsupported'].includes(decoded.kind)) {setLoadError(decoded.message);return;}
            setForm({...newPost(),...post,cover_image:post.cover_image || post.image || ''});
            setDoc(decoded.kind==='structured'?decoded.document:createDocument('longform',post.content || ''));
        }).catch(()=>{if(active)setLoadError('Không tải được bài. Nội dung chưa bị thay đổi.');}).finally(()=>{if(active)setLoading(false);});
        return () => {active=false;};
    },[slug]);
    useEffect(() => {
        const warn = event => {if(dirty || uploadsBusy){event.preventDefault();event.returnValue='';}};
        window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
    },[dirty,uploadsBusy]);
    const updateForm = patch => {setForm(previous=>({...previous,...patch}));setDirty(true);};
    const updateDoc = updater => {setDoc(previous=>typeof updater==='function'?updater(previous):updater);setDirty(true);};
    const section = (name,key,value) => updateDoc(previous=>({...previous,[name]:{...previous[name],[key]:value}}));
    const uploadChange = (key,busy) => setUploads(previous=>({...previous,[key]:busy}));
    const save = async event => {
        event.preventDefault();if(saving||uploadsBusy)return;
        setErrors([]);
        try {
            if(isNew && STATIC_POSTS.some(post=>post.slug===form.slug)) throw new Error('Đường dẫn này thuộc bài mẫu của website. Chọn một slug mới cho bài của bạn.');
            const payload=postPayload(form,doc);
            setSaving(true);
            if(isNew) await adminPosts.create(payload);else await adminPosts.update(slug,payload);
            setDirty(false);navigate('/admin');
        } catch(error) {setErrors(String(error.message || 'Không lưu được bài.').split('\n'));}
        finally {setSaving(false);}
    };
    const exportConfig = () => {
        const blob = new Blob([JSON.stringify(doc,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
        const anchor=window.document.createElement('a');anchor.href=url;anchor.download=`${form.slug || 'article'}-layout.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    const importConfig = async event => {
        const file=event.target.files?.[0];event.target.value='';if(!file)return;
        try {
            if(file.size>1000000)throw new Error('Cấu hình nhập tối đa 1 MB.');
            const decoded=decodeDocument(await file.text());
            if(decoded.kind!=='structured')throw new Error(decoded.message || 'Chọn file cấu hình bài viết hợp lệ.');
            const issues=documentIssues(decoded.document);if(issues.length)throw new Error(issues.join('\n'));
            setBeforeImport(docRef.current);updateDoc(decoded.document);setErrors([]);
        } catch(error){setErrors([error.message]);}
    };
    const issues = documentIssues(doc,{publish:form.status==='Published'});
    if(loading)return <div className="cms-editor editorial-loading" role="status"><Loader2 className="animate-spin" /> Đang tải bài viết...</div>;
    if(loadError)return <div className="cms-editor editorial-loading"><p role="alert">{loadError}</p><Link to="/admin">Quay lại CMS</Link></div>;
    return <div className="cms-editor">
        <Helmet><title>{isNew?'Viết bài mới':'Sửa bài viết'} | Mindtransform CMS</title><meta name="robots" content="noindex,nofollow" /></Helmet>
        <header className="cms-editor-header"><div><Link to="/admin" onClick={event=>{if((dirty||uploadsBusy)&&!window.confirm('Bạn có thay đổi chưa lưu. Rời trình soạn thảo?'))event.preventDefault();}}><ArrowLeft size={17} /> CMS</Link><h1>{isNew?'Viết bài mới':'Chỉnh sửa bài viết'}</h1></div><div><button type="button" className="cms-secondary" onClick={()=>setPreview(value=>!value)}>{preview?<Pencil size={17} />:<Eye size={17} />}{preview?'Tiếp tục soạn':'Xem trước'}</button><button type="submit" form="article-editor-form" className="cms-primary" disabled={saving||uploadsBusy}>{saving?<Loader2 size={17} className="animate-spin" />:<Save size={17} />}{form.status==='Published'?'Xuất bản thay đổi':'Lưu bản nháp'}</button></div></header>
        <main className="cms-editor-main">
            {errors.length>0&&<div className="cms-notice cms-error" role="alert"><strong>Chưa lưu được bài</strong><ul>{errors.map((error,index)=><li key={index}>{error}</li>)}</ul></div>}
            {uploadsBusy&&<p className="cms-notice" role="status">Đang tải ảnh. Chờ hoàn tất trước khi lưu bài.</p>}
            {beforeImport&&<div className="cms-notice">Đã nạp nội dung và bố cục. Có thể hoàn tác trước khi lưu. <button type="button" className="cms-secondary" onClick={()=>{updateDoc(beforeImport);setBeforeImport(null);}}>Hoàn tác nhập</button></div>}
            {isNew&&!preview&&<p className="cms-helper">Bạn có thể bắt đầu từ một bài mẫu đầy đủ rồi sửa nội dung. <button type="button" className="cms-secondary" disabled={uploadsBusy} onClick={()=>{const sample=decodeDocument(STATIC_POSTS[0].content);if(sample.kind==='structured'){setBeforeImport(docRef.current);updateDoc(structuredClone(sample.document));setErrors([]);}}}>Nạp cấu hình bài mẫu</button></p>}
            {preview?<><div className="cms-preview-toolbar"><strong>Xem trước bằng giao diện public</strong><button type="button" className="cms-secondary" aria-pressed={!phone} onClick={()=>setPhone(false)}>Máy tính</button><button type="button" className="cms-secondary" aria-pressed={phone} onClick={()=>setPhone(true)}>Điện thoại</button></div>{issues.length>0&&<div className="cms-notice"><strong>Các mục cần hoàn thiện</strong><ul>{issues.map((issue,index)=><li key={index}>{issue}</li>)}</ul></div>}<div className={`cms-preview-frame ${phone?'is-phone':''}`} onClickCapture={event=>{const anchor=event.target.closest('a');if(anchor&&!anchor.getAttribute('href')?.startsWith('#'))event.preventDefault();}}><ArticleView key={slug} post={{...form,content:JSON.stringify(doc)}} preview /></div><form id="article-editor-form" onSubmit={save} hidden /></>:
            <form id="article-editor-form" onSubmit={save} className="cms-editor-grid">
                <div><section className="cms-panel"><h2>Thông tin bài viết</h2><ConfigField label="Tiêu đề bài viết" value={form.title} onChange={value=>{setForm(previous=>({...previous,title:value,...(isNew&&(!previous.slug||previous.slug===headingSlug(previous.title))?{slug:headingSlug(value)}:{})}));setDirty(true);}} /><ConfigField label="Đường dẫn (slug)" value={form.slug} onChange={value=>updateForm({slug:value})} hint="Ví dụ: quy-trinh-ban-giao. Đường dẫn được giữ khi đổi tiêu đề bài cũ." /><ConfigField label="Tóm tắt cho danh sách và chia sẻ" value={form.summary} multiline onChange={value=>updateForm({summary:value})} /></section>
                    <ArticleBlockEditor key={slug} document={doc} onChange={updateDoc} onUploadChange={uploadChange} uploadsBusy={uploadsBusy} />
                </div>
                <aside className="cms-editor-settings">
                    <section className="cms-panel"><h2>Định dạng & xuất bản</h2><ConfigField label="Định dạng bài" value={doc.format} options={Object.entries(FORMATS).map(([value,label])=>({value,label}))} onChange={value=>updateDoc(previous=>({...previous,format:value}))} /><ConfigField label="Trạng thái" value={form.status} options={[{value:'Draft',label:'Bản nháp'},{value:'Published',label:'Công khai khi lưu'}]} onChange={value=>updateForm({status:value})} /><ConfigField label="Danh mục" value={form.category} options={['Strategy','Technology','Methodology','Data','Case Study'].map(value=>({value,label:value}))} onChange={value=>updateForm({category:value})} /><ConfigField label="Tác giả" value={form.author} onChange={value=>updateForm({author:value})} /><ConfigField label="Ngày đăng" type="date" value={form.date} onChange={value=>updateForm({date:value})} /><ConfigField label="Nền đọc" value={doc.appearance.theme} options={[{value:'paper',label:'Giấy sáng'},{value:'night',label:'Đêm xanh'}]} onChange={value=>section('appearance','theme',value)} /><ConfigField label="Khổ cột đọc" value={doc.appearance.width} options={[{value:'comfortable',label:'Vừa đọc'},{value:'wide',label:'Rộng hơn'}]} onChange={value=>section('appearance','width',value)} /><label className="cms-toggle"><input type="checkbox" checked={doc.appearance.showContents} onChange={event=>section('appearance','showContents',event.target.checked)} /> Hiện mục lục</label></section>
                    <section className="cms-panel"><h2>Bìa & lời dẫn</h2><ConfigField label="Tiêu đề trên bìa (tùy chọn)" value={doc.hero.title} multiline onChange={value=>section('hero','title',value)} hint="Xuống dòng để chia nhịp. Bỏ trống để dùng tiêu đề bài." /><ConfigField label="Nhãn đầu bài" value={doc.hero.label} onChange={value=>section('hero','label',value)} /><ConfigField label="Lời dẫn đầu bài" value={doc.hero.lead} multiline onChange={value=>section('hero','lead',value)} /><ConfigField label="Kiểu bìa" value={doc.hero.coverMode} options={[{value:'image',label:'Ảnh bìa'},{value:'workflow',label:'Sơ đồ từ khối quy trình đầu tiên'},{value:'none',label:'Chỉ chữ'}]} onChange={value=>section('hero','coverMode',value)} /><ConfigImage label="Ảnh bìa" value={form.cover_image} onChange={value=>updateForm({cover_image:value})} onUploadChange={busy=>uploadChange('cover',busy)} /><ConfigField label="Chú thích ảnh bìa" value={doc.hero.caption} onChange={value=>section('hero','caption',value)} /><ConfigField label="Ghi chú nguồn / dữ liệu demo" value={doc.hero.disclosure} multiline onChange={value=>section('hero','disclosure',value)} /></section>
                    <section className="cms-panel"><h2>Hành động cuối bài</h2><label className="cms-toggle"><input type="checkbox" checked={doc.cta.enabled} onChange={event=>section('cta','enabled',event.target.checked)} /> Hiện lời mời hành động</label>{doc.cta.enabled&&<><ConfigField label="Tiêu đề cuối bài" value={doc.cta.title} onChange={value=>section('cta','title',value)} /><ConfigField label="Nội dung cuối bài" value={doc.cta.body} multiline onChange={value=>section('cta','body',value)} /><ConfigField label="Nhãn nút cuối bài" value={doc.cta.label} onChange={value=>section('cta','label',value)} /><ConfigField label="Hành động của nút" value={doc.cta.action} options={[{value:'consult',label:'Mở form tư vấn'},{value:'link',label:'Đi đến liên kết'}]} onChange={value=>section('cta','action',value)} />{doc.cta.action==='link'&&<ConfigField label="Liên kết cuối bài" value={doc.cta.url} onChange={value=>section('cta','url',value)} />}</>}</section>
                    <section className="cms-panel"><h2>Tái sử dụng cấu hình</h2><p className="cms-helper">Xuất bố cục để dùng lại cho bài khác. File không bao gồm tiêu đề SEO, slug hay trạng thái xuất bản.</p><div className="cms-inline-actions"><button type="button" className="cms-secondary" onClick={exportConfig}><Download size={16} /> Xuất JSON</button><button type="button" className="cms-secondary" onClick={()=>importInput.current?.click()}><Upload size={16} /> Nhập JSON</button></div><input ref={importInput} type="file" accept="application/json,.json" onChange={importConfig} aria-label="Nhập file cấu hình bài" hidden /></section>
                </aside>
            </form>}
        </main>
    </div>;
}
