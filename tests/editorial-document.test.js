import test from 'node:test';
import assert from 'node:assert/strict';
import { BLOCK_TYPES, createBlock, createDocument, decodeDocument, encodeDocument, documentIssues, duplicateBlock, postPayload } from '../src/utils/editorialDocument.js';
import { normalizePost } from '../src/utils/post.js';

test('all block types and per-article configuration survive JSON storage without a slug registry',()=>{
    const doc=createDocument('explainer');doc.blocks=Object.keys(BLOCK_TYPES).map(createBlock);doc.appearance.theme='night';doc.hero.title='Bìa riêng';doc.cta.enabled=false;
    const decoded=decodeDocument(encodeDocument(doc));
    assert.equal(decoded.kind,'structured');assert.deepEqual(decoded.document,doc);assert.equal(decoded.document.blocks.length,9);
    const copy=duplicateBlock(doc.blocks[0]);assert.notEqual(copy.id,doc.blocks[0].id);assert.equal(copy.content,doc.blocks[0].content);
});
test('publish validation checks evidence sources, media alt text and unsafe links; incomplete drafts remain editable',()=>{
    const doc=createDocument();doc.blocks.push(createBlock('image'),createBlock('stats'));
    assert.equal(documentIssues(doc).length,0);
    assert.ok(documentIssues(doc,{publish:true}).some(issue=>/nguồn số liệu/.test(issue)));
    assert.ok(documentIssues(doc,{publish:true}).some(issue=>/mô tả ảnh/.test(issue)));
    doc.blocks[1].src='javascript:alert(1)';assert.throws(()=>encodeDocument(doc),/URL/);
    doc.blocks[1].src='/photo.webp';doc.blocks[1].id=doc.blocks[0].id;assert.throws(()=>encodeDocument(doc),/trùng/);
});
test('future versions and malformed typed data are rejected without treating configuration as legacy HTML',()=>{
    const doc=createDocument();assert.equal(decodeDocument(JSON.stringify({...doc,version:99})).kind,'unsupported');
    assert.equal(decodeDocument('{"schema":"mindtransform.article",').kind,'invalid');
    const gallery=createBlock('gallery');gallery.images=[null];doc.blocks=[gallery];assert.equal(decodeDocument(JSON.stringify(doc)).kind,'invalid');
    doc.blocks=[createBlock('text')];doc.hero.title={bad:true};assert.equal(decodeDocument(JSON.stringify(doc)).kind,'invalid');
});
test('legacy HTML/Markdown convert losslessly and post writes use the documented image column',()=>{
    for(const source of ['<h2>Bài cũ</h2><p>Nội dung</p>','## Bài cũ\nNội dung'])assert.equal(createDocument('longform',source).blocks[0].content,source);
    const doc=createDocument();const payload=postPayload({id:99,title:'Bài mới',slug:'bai-moi',status:'Draft',cover_image:'/cover.webp'},doc);
    assert.equal(payload.image,'/cover.webp');assert.equal(payload.cover_image,undefined);assert.equal(payload.id,undefined);assert.equal(decodeDocument(payload.content).kind,'structured');
    assert.equal(postPayload({title:'Xóa ảnh',slug:'xoa-anh',status:'Draft',cover_image:'',image:'/old.webp'},doc).image,'');
    assert.equal(normalizePost({image:'',cover_image:'/old.webp'}).cover_image,'');
});
