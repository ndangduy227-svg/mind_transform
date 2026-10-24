import './dom-setup.js';
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import MindAI from '../src/pages/MindAI.jsx';
import LeadForm from '../src/components/LeadForm.jsx';
import NotFound from '../src/pages/NotFound.jsx';
import { state, reset } from './ui-mocks.js';

beforeEach(() => {
    reset();
    globalThis.fetch = async (_url, options) => {
        const body = JSON.parse(options.body); state.chats.push(body);
        return { ok: !state.failChat, json: async () => state.failChat ? { error: 'Test error' }
            : { analysis: `Nhận định ${state.chats.length}`, score: 50, next_question: `Câu tiếp theo ${state.chats.length}` } };
    };
});
afterEach(() => cleanup());
function view(component) {
    return render(<HelmetProvider><MemoryRouter><MotionConfig reducedMotion="always" transition={{ duration: 0 }}>{component}</MotionConfig></MemoryRouter></HelmetProvider>);
}
async function start() {
    view(<MindAI />);
    fireEvent.change(screen.getByLabelText(/Ngành nghề/), { target: { value: 'Bán lẻ' } });
    fireEvent.change(screen.getByLabelText(/Quy mô/), { target: { value: '11-50 người' } });
    fireEvent.change(screen.getByLabelText('Câu hỏi của bạn'), { target: { value: 'Tin nhắn đầu tiên cần được giữ lại' } });
    fireEvent.click(screen.getByRole('button', { name: /Bắt đầu tư vấn/ }));
    await screen.findByLabelText('Email');
}

test('email input stays mounted while typing, and a saved lead includes the first exchange', async () => {
    await start();
    await screen.findByText('Đã dùng 1/5 lượt miễn phí');
    const input = screen.getByLabelText('Email');
    for (const value of ['t', 'te', 'test@example.com']) {
        fireEvent.change(input, { target: { value } });
        assert.equal(screen.getByLabelText('Email'), input); assert.equal(input.value, value);
    }
    fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Người kiểm thử' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu tư vấn' }));
    await screen.findByText('Đã gửi yêu cầu thành công!');
    assert.equal(state.leads.length, 1);
    const saved = JSON.parse(state.leads[0].need);
    assert.equal(saved.conversation[0].user, 'Tin nhắn đầu tiên cần được giữ lại');
    assert.match(saved.conversation[0].ai, /Nhận định 1/);
    assert.equal(saved.intake.companySize, '11-50 người');
    assert.equal(screen.getByRole('link', { name: 'Quay về trang chủ' }).getAttribute('href'), '/');
});
test('five exchanges are allowed and each request contains only preceding successful turns', async () => {
    await start();
    await screen.findByText('Đã dùng 1/5 lượt miễn phí');
    for (let number = 2; number <= 5; number++) {
        fireEvent.change(screen.getByLabelText('Câu trả lời của bạn'), { target: { value: `Trả lời ${number}` } });
        fireEvent.click(screen.getByRole('button', { name: 'Gửi câu trả lời' }));
        await screen.findByText(`Đã dùng ${number}/5 lượt miễn phí`);
    }
    assert.equal(state.chats.length, 5);
    assert.equal(state.chats[4].messageCount, 5);
    assert.equal(state.chats[4].history.length, 4);
    assert.equal(state.chats[4].history[0].user, 'Tin nhắn đầu tiên cần được giữ lại');
    assert.equal(state.chats[4].history.some(item => item.user === 'Trả lời 5'), false);
    assert.ok(screen.getByText('Câu tiếp theo 5'));
    fireEvent.click(screen.getByRole('button', { name: 'Xem lại & gửi yêu cầu' }));
    assert.equal(screen.getByLabelText('Email').value, '');
});
test('failed AI request preserves the question and does not consume a successful turn', async () => {
    state.failChat = true;
    await start();
    await screen.findByRole('alert');
    assert.equal(screen.getByLabelText('Câu trả lời của bạn').value, 'Tin nhắn đầu tiên cần được giữ lại');
    assert.ok(screen.getByText('Đã dùng 0/5 lượt miễn phí'));
    state.failChat = false;
    fireEvent.click(screen.getByRole('button', { name: 'Gửi câu trả lời' }));
    await screen.findByText('Đã dùng 1/5 lượt miễn phí');
    assert.equal(state.chats[1].messageCount, 1);
    assert.deepEqual(state.chats[1].history, []);
});
test('lead save failure preserves contact and transcript for retry', async () => {
    await start();
    await screen.findByText('Đã dùng 1/5 lượt miễn phí');
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Người kiểm thử' } });
    state.failLead = true;
    fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu tư vấn' }));
    await screen.findByRole('alert');
    assert.equal(screen.getByLabelText('Email').value, 'test@example.com');
    assert.ok(screen.getByText('Đã dùng 1/5 lượt miễn phí'));
    state.failLead = false;
    fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu tư vấn' }));
    await screen.findByText('Đã gửi yêu cầu thành công!');
    assert.equal(state.leads.length, 1);
});
test('contact dialog exposes labels, reports failure inline, preserves input and handles Escape', async () => {
    let closed = 0;
    view(<LeadForm isOpen onClose={() => closed++} />);
    assert.ok(screen.getByRole('dialog', { name: 'Kết nối với Mind.Transform' }));
    for (const [label, value] of [['Họ và tên', 'Người kiểm thử'], ['Số điện thoại', '0900000000'], ['Email công việc', 'test@example.com']]) {
        fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    state.failLead = true;
    fireEvent.click(screen.getByRole('button', { name: 'Gửi thông tin' }));
    await screen.findByRole('alert');
    assert.equal(screen.getByLabelText('Email công việc').value, 'test@example.com');
    fireEvent.keyDown(document, { key: 'Escape' });
    assert.equal(closed, 1);
});
test('unknown URL page offers working home and template links', () => {
    view(<NotFound />);
    assert.ok(screen.getByRole('heading', { name: 'Không tìm thấy trang' }));
    assert.equal(screen.getByRole('link', { name: 'Về trang chủ' }).getAttribute('href'), '/');
    assert.equal(screen.getByRole('link', { name: 'Xem templates' }).getAttribute('href'), '/templates');
});
