import './dom-setup.js';
import test,{beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import {ModalProvider} from '../src/context/ModalContext';
import PostEditor from '../src/pages/admin/PostEditor';
import BlogPost from '../src/pages/BlogPost';
import ImageUpload from '../src/components/admin/ImageUpload';
import {adminPosts} from '../src/services/cmsAdminService';
import {invalidateCache} from '../src/services/cmsService';
import {createBlock,createDocument,encodeDocument,decodeDocument} from '../src/utils/editorialDocument';
import ArticleView from '../src/components/blog/ArticleView';
import {state,reset} from './ui-mocks';

beforeEach(()=>{reset();invalidateCache();window.confirm=()=>true;});afterEach(()=>cleanup());
function view(path='/admin/post/new'){return render(<HelmetProvider><ModalProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/admin/post/:slug" element={<PostEditor/>}/><Route path="/admin" element={<p>CMS saved</p>}/><Route path="/blog/:slug" element={<BlogPost/>}/></Routes></MemoryRouter></ModalProvider></HelmetProvider>);}
const change=(label,value)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
function add(type){change('Loại khối cần thêm',type);fireEvent.click(screen.getByRole('button',{name:'Thêm khối'}));}

test('create, preview, save, reload and edit an arbitrary Longform article in CMS',async()=>{
    view();change('Tiêu đề bài viết','Nhật ký cửa hàng');change('Nội dung soạn thảo','<h2>Ghi nhận đầu ngày</h2><p>Nội dung riêng của cửa hàng.</p>');
    change('Nền đọc','night');change('Khổ cột đọc','wide');fireEvent.click(screen.getByLabelText('Hiện mục lục'));
    add('stats');change('Tiêu đề khối','Số liệu kiểm tra');change('Số liệu 1 — Giá trị','12');change('Số liệu 1 — Nhãn','Phiếu mẫu');change('Nguồn số liệu / phạm vi áp dụng','Bộ dữ liệu kiểm thử nội bộ');
    fireEvent.click(screen.getByRole('button',{name:'Xem trước'}));assert.ok(screen.getByRole('heading',{name:'Số liệu kiểm tra'}));assert.ok(document.querySelector('.editorial-theme-night.editorial-width-wide'));
    assert.equal(screen.queryByRole('navigation',{name:'Mục lục bài viết'}),null);
    fireEvent.click(screen.getByRole('button',{name:'Điện thoại'}));assert.ok(document.querySelector('.cms-preview-frame.is-phone'));
    fireEvent.click(screen.getByRole('button',{name:'Lưu bản nháp'}));await screen.findByText('CMS saved');
    const saved=state.posts[0];assert.equal(saved.slug,'nhat-ky-cua-hang');assert.equal(saved.status,'Draft');assert.equal(decodeDocument(saved.content).document.blocks[1].items[0].value,'12');
    cleanup();view('/admin/post/nhat-ky-cua-hang');await screen.findByLabelText('Tiêu đề bài viết');assert.equal(screen.getByLabelText('Nền đọc').value,'night');
    fireEvent.click(screen.getByRole('button',{name:/2\. Cụm số liệu/}));assert.equal(screen.getByLabelText('Số liệu 1 — Giá trị').value,'12');change('Số liệu 1 — Giá trị','15');change('Trạng thái','Published');
    fireEvent.click(screen.getByRole('button',{name:'Xuất bản thay đổi'}));await screen.findByText('CMS saved');
    cleanup();view('/blog/nhat-ky-cua-hang');await screen.findByRole('heading',{name:'Số liệu kiểm tra'});assert.ok(screen.getByText('15'));assert.ok(screen.getByText('Bộ dữ liệu kiểm thử nội bộ'));
});

test('a different slug can publish an explainer with one workflow step, custom CTA and independent config',async()=>{
    view();change('Tiêu đề bài viết','Quy trình quán cà phê');change('Định dạng bài','explainer');change('Nội dung soạn thảo','<h2>Nhận ca</h2><p>Đọc hướng dẫn.</p>');change('Kiểu bìa','workflow');
    add('workflow');change('Bước quy trình 1 — Tên bước','Nhận ca');change('Bước quy trình 1 — Tiêu đề giải thích','Xác nhận người nhận');change('Bước quy trình 1 — Nội dung giải thích','Ghi rõ người phụ trách ca này.');
    change('Hành động của nút','link');change('Liên kết cuối bài','/templates');change('Nhãn nút cuối bài','Lấy mẫu nhận ca');change('Trạng thái','Published');
    fireEvent.click(screen.getByRole('button',{name:'Xuất bản thay đổi'}));await screen.findByText('CMS saved');
    cleanup();view('/blog/quy-trinh-quan-ca-phe');await screen.findByRole('heading',{name:'Xác nhận người nhận'});assert.ok(document.querySelector('.editorial-format-explainer'));assert.equal(screen.getByRole('link',{name:'Lấy mẫu nhận ca'}).getAttribute('href'),'/templates');
});

test('block ordering, duplication and reversible removal persist in the stored document',async()=>{
    view();change('Tiêu đề bài viết','Bố cục có thứ tự');change('Nội dung soạn thảo','<p>Đoạn đầu.</p>');add('quote');change('Nội dung trích dẫn / ý nhấn','Một ý cần nhớ');
    fireEvent.click(screen.getByRole('button',{name:'Nhân đôi khối 2'}));fireEvent.click(screen.getByRole('button',{name:'Đưa khối 3 lên'}));fireEvent.click(screen.getByRole('button',{name:'Xóa khối 2'}));fireEvent.click(screen.getByRole('button',{name:'Hoàn tác xóa khối'}));
    fireEvent.click(screen.getByRole('button',{name:'Lưu bản nháp'}));await screen.findByText('CMS saved');const doc=decodeDocument(state.posts[0].content).document;assert.deepEqual(doc.blocks.map(block=>block.type),['text','quote','quote']);assert.equal(new Set(doc.blocks.map(block=>block.id)).size,3);
});

test('save failures keep the draft and publishing incomplete blocks gives actionable errors',async()=>{
    view();change('Tiêu đề bài viết','Giữ lại bản nháp');change('Nội dung soạn thảo','<p>Không được mất.</p>');state.failPost=true;
    fireEvent.click(screen.getByRole('button',{name:'Lưu bản nháp'}));await screen.findByRole('alert');assert.equal(screen.getByLabelText('Tiêu đề bài viết').value,'Giữ lại bản nháp');
    state.failPost=false;add('stats');change('Trạng thái','Published');fireEvent.click(screen.getByRole('button',{name:'Xuất bản thay đổi'}));await screen.findByText(/Thiếu nguồn số liệu/);assert.equal(state.posts.length,0);
});

test('image-column compatibility retries safely, zero-row updates fail, and media removal only unlinks',async()=>{
    state.coverOnly=true;await adminPosts.create({title:'Compat',slug:'compat',status:'Draft',content:encodeDocument(createDocument()),image:'/photo.webp'});assert.equal(state.posts[0].cover_image,'/photo.webp');
    await assert.rejects(()=>adminPosts.update('missing',{title:'Missing',slug:'missing',status:'Draft',content:''}),/Không cập nhật/);
    let cleared=false;render(<ImageUpload value="https://example.com/storage/v1/object/public/images/shared.webp" removeFromStorage={false} onChange={value=>{cleared=value==='';}}/>);fireEvent.click(screen.getByRole('button',{name:'Xoá'}));assert.equal(cleared,true);
});

test('all generic blocks render with timeline, gallery, comparison and checklist interactions',()=>{
    const doc=createDocument('explainer');doc.blocks=[];
    const text=createBlock('text');text.content='<h2>Khối đầu</h2><p>Đọc nhanh.</p>';
    const image=createBlock('image');Object.assign(image,{src:'/picture.webp',alt:'Hình minh họa riêng'});
    const quote=createBlock('quote');Object.assign(quote,{text:'Một câu cần nhớ',attribution:'Nhóm vận hành'});
    const stats=createBlock('stats');stats.items=[{value:'5',label:'Phiếu mẫu'}];stats.source='Dữ liệu kiểm thử';
    const workflow=createBlock('workflow');workflow.steps=[{name:'Bước một',summary:'Ghi nhận',title:'Rõ đầu vào',copy:'Thông tin đầy đủ.'}];
    const gallery=createBlock('gallery');gallery.images=[{src:'/a.webp',title:'Ảnh một',caption:'Đầu'},{src:'/b.webp',title:'Ảnh hai',caption:'Sau'}];
    const timeline=createBlock('timeline');timeline.title='Các mốc';timeline.events=[{label:'Ngày 1',title:'Khảo sát',body:'Ghi hiện trạng.'}];
    const compare=createBlock('comparison');compare.items=[{name:'Bàn giao',before:'Chưa rõ người nhận',after:'Có người xác nhận'}];
    const checklist=createBlock('checklist');checklist.items=['Kiểm tra đầu vào'];
    doc.blocks=[text,image,quote,stats,workflow,gallery,timeline,compare,checklist];
    render(<MemoryRouter><ArticleView post={{title:'Bài nhiều khối',slug:'bai-nhieu-khoi',content:encodeDocument(doc,{publish:true})}} preview /></MemoryRouter>);
    assert.ok(screen.getByRole('heading',{name:'Khảo sát'}));assert.ok(screen.getByText('Một câu cần nhớ'));
    fireEvent.click(screen.getByRole('button',{name:'Cách đề xuất'}));assert.ok(screen.getByText('Có người xác nhận'));
    fireEvent.click(screen.getByLabelText('Kiểm tra đầu vào'));assert.ok(screen.getByText('1/1 mục đã kiểm tra'));
    fireEvent.click(screen.getByRole('button',{name:'Ảnh tiếp'}));assert.ok(screen.getByRole('heading',{name:'Ảnh hai'}));
});

test('import can be undone, future schemas are rejected, and example reuse keeps article metadata',async()=>{
    view();change('Tiêu đề bài viết','Nội dung của tôi');change('Nội dung soạn thảo','<p>Nội dung cần giữ.</p>');
    const other=createDocument('standard');other.blocks[0].content='<p>Nội dung nhập.</p>';
    fireEvent.change(screen.getByLabelText('Nhập file cấu hình bài'),{target:{files:[{size:200,text:async()=>encodeDocument(other)}]}});
    await screen.findByRole('button',{name:'Hoàn tác nhập'});assert.equal(screen.getByLabelText('Định dạng bài').value,'standard');
    fireEvent.click(screen.getByRole('button',{name:'Hoàn tác nhập'}));assert.equal(screen.getByLabelText('Nội dung soạn thảo').value,'<p>Nội dung cần giữ.</p>');
    fireEvent.change(screen.getByLabelText('Nhập file cấu hình bài'),{target:{files:[{size:200,text:async()=>JSON.stringify({...other,version:20})}]}});
    await screen.findByRole('alert');assert.equal(screen.getByLabelText('Nội dung soạn thảo').value,'<p>Nội dung cần giữ.</p>');
    fireEvent.click(screen.getByRole('button',{name:'Nạp cấu hình bài mẫu'}));assert.equal(screen.getByLabelText('Tiêu đề bài viết').value,'Nội dung của tôi');
    fireEvent.click(screen.getByRole('button',{name:'Lưu bản nháp'}));await screen.findByText('CMS saved');assert.equal(state.posts[0].status,'Draft');assert.equal(decodeDocument(state.posts[0].content).document.blocks.length,10);
});
