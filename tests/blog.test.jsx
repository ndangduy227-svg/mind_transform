import './dom-setup.js';
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { render, screen, fireEvent, cleanup, within, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider, useModal } from '../src/context/ModalContext';
import Blog from '../src/pages/Blog';
import BlogPost from '../src/pages/BlogPost';
import ArticleBody, { articleModel } from '../src/components/blog/ArticleBody';
import { invalidateCache, posts as postsService } from '../src/services/cmsService';
import { state, reset } from './ui-mocks';

beforeEach(() => { reset(); invalidateCache(); });
afterEach(() => cleanup());
function ModalState() { const { isFormOpen } = useModal(); return isFormOpen ? <p>Consultation opened</p> : null; }
function Path() { const loc = useLocation(); return <output aria-label="Current route">{loc.pathname + loc.search + loc.hash}</output>; }
function view(path = '/blog/oto-hop-nhat-sales-garage-ops') {
    return render(<HelmetProvider><ModalProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/blog" element={<Blog />} /><Route path="/blog/:slug" element={<BlogPost />} /></Routes><ModalState /><Path /><Link to="/blog/oto-hop-nhat-sales-garage-ops">Open sample</Link></MemoryRouter></ModalProvider></HelmetProvider>);
}

const cmsPost = {slug:'ban-giao-thuc-te',title:'Bàn giao thực tế',summary:null,category:'Strategy',content:'## Hiện trạng\nNội dung',date:'2026-10-24',status:'Published'};
function deferred() {
    let resolve, reject;
    const promise = new Promise((onResolve, onReject) => { resolve=onResolve;reject=onReject; });
    return {promise,resolve,reject};
}

test('bundled articles are immediately readable while the CMS is pending, then published CMS posts appear', async () => {
    const pending = deferred();
    state.readPosts = () => pending.promise;
    view('/blog');
    assert.ok(screen.getByRole('heading', {name:'Lark là gì? Của ai, chi phí bao nhiêu và dùng để làm gì?'}));
    assert.equal(screen.queryByText('Đang tải bài viết...'),null);
    fireEvent.change(screen.getByRole('searchbox',{name:'Tìm bài viết'}),{target:{value:'báo cáo bán hàng'}});
    assert.ok(screen.getByRole('heading',{name:'Báo cáo bán hàng hằng ngày trên Lark: từ cuối ca đến dashboard'}));
    fireEvent.click(screen.getByRole('link',{name:'Đọc câu chuyện'}));
    await screen.findByRole('heading',{name:'Một luồng báo cáo đơn giản'});
    fireEvent.click(screen.getByRole('link',{name:'Góc vận hành'}));
    await screen.findByRole('searchbox',{name:'Tìm bài viết'});
    assert.equal(state.postReads.length,1);
    assert.equal(state.postReads[0].retryEnabled,false);
    assert.ok(state.postReads[0].signal instanceof AbortSignal);
    fireEvent.change(screen.getByRole('searchbox',{name:'Tìm bài viết'}),{target:{value:''}});
    await act(async () => pending.resolve({data:[cmsPost],error:null}));
    assert.ok(await screen.findByRole('heading',{name:cmsPost.title}));
});

test('a failed CMS request leaves bundled articles usable and avoids repeated requests on remount', async () => {
    const pending = deferred();
    state.readPosts = () => pending.promise;
    view('/blog');
    await act(async () => pending.reject(new TypeError('Failed to fetch')));
    assert.ok(screen.getByRole('heading',{name:'Lark là gì? Của ai, chi phí bao nhiêu và dùng để làm gì?'}));
    assert.equal(screen.queryByRole('alert'),null);
    cleanup();
    view('/blog');
    await act(async () => {});
    assert.equal(state.postReads.length,1);
    assert.ok(screen.getByRole('heading',{name:'Lark là gì? Của ai, chi phí bao nhiêu và dùng để làm gì?'}));
});

test('failed revalidation retains previously loaded CMS content', async t => {
    state.posts = [cmsPost];
    await postsService.getAll();
    const expiredTime = Date.now() + 5 * 60 * 1000 + 1;
    t.mock.method(Date,'now',() => expiredTime);
    state.readPosts = () => ({data:null,error:{message:'CMS unavailable'}});
    view('/blog?q=ban%20giao&category=Strategy');
    assert.ok(screen.getByRole('heading',{name:cmsPost.title}));
    await act(async () => { await postsService.getAll(); });
    assert.ok(screen.getByRole('heading',{name:cmsPost.title}));
    assert.equal(state.postReads.length,2);
});

test('admin invalidation prevents an older CMS response from restoring removed content', async () => {
    const old = deferred(), fresh = deferred();
    let calls=0;
    state.readPosts = () => (++calls===1 ? old.promise : fresh.promise);
    const oldRequest=postsService.getAll();
    await waitFor(() => assert.equal(state.postReads.length,1));
    invalidateCache('posts');
    const freshRequest=postsService.getAll();
    await waitFor(() => assert.equal(state.postReads.length,2));
    fresh.resolve({data:[],error:null});
    await freshRequest;
    old.resolve({data:[cmsPost],error:null});
    await oldRequest;
    assert.equal(postsService.getCached().some(post=>post.slug===cmsPost.slug),false);
});

test('longform has working TOC targets, interactive workflow, gallery, checklist and contact action', async () => {
    view();
    await screen.findByRole('heading', { name: /Bán được xe/ });
    const toc = screen.getByRole('navigation', { name: 'Mục lục bài viết', hidden: true });
    const links = within(toc).getAllByRole('link', { hidden: true });
    assert.equal(links.length, 4);
    for (const link of links) assert.ok(document.getElementById(link.getAttribute('href').slice(1)));
    assert.ok(screen.getByText(/Case thiết kế với dữ liệu demo/));
    fireEvent.click(screen.getByRole('button', { name: /03 Kho vật tư/ }));
    assert.ok(screen.getByRole('heading', { name: /Có tồn chưa chắc/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp' }));
    assert.ok(screen.getByRole('heading', { name: 'Pipeline bán hàng' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mở ảnh: Pipeline bán hàng' }));
    assert.ok(screen.getByRole('dialog', { name: 'Pipeline bán hàng' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đóng ảnh' }));
    assert.equal(screen.queryByRole('dialog'), null);
    assert.ok(document.querySelector('.article-reader-checklist'));
    fireEvent.click(screen.getByLabelText('Đã có người chịu trách nhiệm gỡ điều còn thiếu chưa?'));
    assert.ok(screen.getByText('1/3 mục đã kiểm tra'));
    fireEvent.click(screen.getByRole('button', { name: /Cùng Mindtransform/ }));
    assert.ok(screen.getByText('Consultation opened'));
});

test('search tolerates missing summaries and preserves filters on article round trip', async () => {
    state.posts = [{ slug:'ban-giao-thuc-te', title:'Bàn giao thực tế', summary:null, category:'Strategy', content:'## Hiện trạng\nNội dung', date:'2026-10-24', status:'Published' }];
    view('/blog?q=ban%20giao&category=Strategy');
    await screen.findByRole('heading', { name:'Bàn giao thực tế' });
    fireEvent.click(screen.getByRole('link', { name:'Đọc câu chuyện' }));
    await screen.findByRole('heading', { name:'Hiện trạng' });
    fireEvent.click(screen.getByRole('link', { name:'Góc vận hành' }));
    await screen.findByRole('heading', { name:'Bàn giao thực tế' });
    assert.equal(screen.getByRole('searchbox', { name:'Tìm bài viết' }).value,'ban giao');
    assert.match(screen.getByLabelText('Current route').textContent,/category=Strategy/);
});

test('short Lark guides show a text cover, official sources and links to every scope', async () => {
    view('/blog?q=Lark&category=Technology');
    await screen.findByRole('heading', { name:'Lark là gì? Của ai, chi phí bao nhiêu và dùng để làm gì?' });
    assert.ok(screen.getByText(/Hiểu & dùng Lark.*Bài ngắn/i));
    assert.equal(screen.queryByLabelText('Sơ đồ quy trình'),null);
    fireEvent.click(screen.getByRole('link', { name:'Đọc câu chuyện' }));
    await screen.findByRole('heading', { name:'Lark là gì, của đơn vị nào?' });
    assert.equal(screen.getByRole('link', {name:'bảng giá chính thức kiểm tra ngày 25/10/2026'}).getAttribute('href'),'https://www.larksuite.com/vi_vn/plans');
    const scopeNames=['Cộng tác nội bộ','Giao việc và theo dõi dự án','Báo cáo bán hàng hằng ngày','Checklist cửa hàng, bàn giao ca','Theo dõi khách hàng','Phê duyệt đề xuất','Tài liệu và đào tạo nội bộ','Theo dõi tồn kho, đề nghị bổ sung'];
    for(const name of scopeNames) assert.match(screen.getByRole('link',{name,exact:true}).getAttribute('href'),/^\/blog\//);
    assert.equal(screen.getByRole('link',{name:'Báo cáo bán hàng hằng ngày',exact:true}).getAttribute('href'),'/blog/bao-cao-ban-hang-hang-ngay-tren-lark');
    cleanup();
    view('/blog/bao-cao-ban-hang-hang-ngay-tren-lark');
    await screen.findByRole('heading',{name:'Một luồng báo cáo đơn giản'});
    assert.ok(screen.getByRole('button',{name:'Nhận MIND Map miễn phí'}));
});

test('CMS HTML retains authored anchors, de-duplicates headings and removes active content', () => {
    const content = '<h2 id="custom">Đầu</h2><h2 id="custom">Cuối</h2><p id="footnote">Ghi chú</p><p onclick="alert(1)"><a href="javascript:alert(1)">Unsafe link</a></p><script>alert(1)</script><iframe src="https://example.com"></iframe><p><img src="/demo.webp" alt="Evidence" onerror="alert(1)"></p>';
    const model = articleModel(content);
    const { container } = render(<ArticleBody model={model} />);
    assert.deepEqual(model.headings.map(item => item.id), ['custom','custom-2']);
    assert.ok(document.getElementById('custom-2'));
    assert.ok(document.getElementById('footnote'));
    assert.equal(screen.getByRole('link', { name:'Mở nội dung nhúng' }).getAttribute('href'), 'https://example.com');
    assert.equal(container.querySelector('script,iframe,[onclick],[onerror]'), null);
    assert.equal(screen.getByText('Unsafe link').hasAttribute('href'),false);
    assert.equal(document.querySelector('p > figure'), null);
    assert.ok(screen.getByRole('button', { name:'Mở ảnh: Evidence' }));
});

test('formatted Markdown headings and standalone image figures render with stable anchors', () => {
    const content = '## Điểm **bàn giao**\n\n![Sơ đồ](/diagram.webp)\n\n## Điểm bàn giao';
    render(<ArticleBody model={articleModel(content)} />);
    assert.ok(document.getElementById('diem-ban-giao'));
    assert.ok(document.getElementById('diem-ban-giao-2'));
    assert.equal(document.querySelector('p > figure'),null);
});

test('missing post can recover to a valid post without stale error state', async () => {
    view('/blog/missing');
    await screen.findByRole('heading', { name:'Bài viết không tồn tại.' });
    fireEvent.click(screen.getByRole('link', { name:'Open sample' }));
    await screen.findByRole('heading', { name:/Bán được xe/ });
    assert.equal(screen.queryByText('Bài viết không tồn tại.'),null);
});
