import './dom-setup.js';
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminLogin from '../src/pages/admin/AdminLogin.jsx';
import PasswordRecoveryRedirect from '../src/components/PasswordRecoveryRedirect.jsx';
import { passwordRecovery } from '../src/services/passwordRecovery.js';
import { state, reset, emitAuth } from './ui-mocks.js';

beforeEach(() => { reset(); passwordRecovery.clear(); });
afterEach(() => cleanup());
function view(path = '/admin/login') {
    return render(<HelmetProvider><MemoryRouter initialEntries={[path]}><PasswordRecoveryRedirect /><Routes>
        <Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin" element={<p>CMS dashboard</p>} /><Route path="/" element={<p>Home page</p>} />
    </Routes></MemoryRouter></HelmetProvider>);
}
function recover() { emitAuth('PASSWORD_RECOVERY', {user:{id:'test-user'}}); }
function fillPasswords(confirmation = 'Test-password-123!') {
    fireEvent.change(screen.getByLabelText('Mật khẩu mới'), {target:{value:'Test-password-123!'}});
    fireEvent.change(screen.getByLabelText('Xác nhận mật khẩu mới'), {target:{value:confirmation}});
}

test('forgot sends one request to the existing callback, and a network failure can be retried', async () => {
    view();
    fireEvent.click(screen.getByRole('button', {name:'Quên mật khẩu?'}));
    fireEvent.change(screen.getByLabelText('Email'), {target:{value:'test@example.com'}});
    state.authThrows = true;
    fireEvent.click(screen.getByRole('button', {name:'Gửi link đặt lại mật khẩu'}));
    await screen.findByRole('alert');
    assert.equal(screen.getByLabelText('Email').value, 'test@example.com');
    assert.equal(screen.getByRole('button', {name:'Gửi link đặt lại mật khẩu'}).disabled, false);
    state.authThrows = false;
    fireEvent.click(screen.getByRole('button', {name:'Gửi link đặt lại mật khẩu'}));
    await screen.findByRole('heading', {name:'Kiểm tra email'});
    assert.equal(state.authCalls.length, 2);
    assert.deepEqual(state.authCalls[1], {method:'resetPasswordForEmail',payload:{email:'test@example.com',options:{redirectTo:'http://localhost/admin/login'}}});
    assert.match(screen.getByText(/Nếu test@example.com/).textContent, /có tài khoản/);
});

test('a recovery event before mount redirects the homepage and allows a confirmed password update', async () => {
    recover(); view('/');
    await screen.findByRole('heading', {name:'Đặt mật khẩu mới'});
    fillPasswords('Different-password');
    fireEvent.click(screen.getByRole('button', {name:'Lưu mật khẩu mới'}));
    await screen.findByText('Hai mật khẩu chưa khớp.');
    assert.equal(state.authCalls.length, 0);
    fillPasswords();
    fireEvent.click(screen.getByRole('button', {name:'Lưu mật khẩu mới'}));
    await screen.findByRole('heading', {name:'Đã đổi mật khẩu'});
    assert.deepEqual(state.authCalls.map(call=>call.method), ['updateUser']);
    assert.equal(state.authCalls[0].payload.password, 'Test-password-123!');
    assert.equal(passwordRecovery.getSnapshot().status, 'idle');
    assert.equal(screen.queryByLabelText('Mật khẩu mới'), null);
    fireEvent.click(screen.getByRole('button', {name:'Vào CMS'}));
    await screen.findByText('CMS dashboard');
});

test('reset failures retain the form for retry, and cancel signs out the recovery session', async () => {
    recover(); view(); fillPasswords();
    state.authError = {code:'weak_password'};
    fireEvent.click(screen.getByRole('button', {name:'Lưu mật khẩu mới'}));
    await screen.findByRole('alert');
    await waitFor(() => assert.equal(screen.getByRole('button', {name:'Lưu mật khẩu mới'}).disabled, false));
    assert.equal(screen.getByLabelText('Mật khẩu mới').value, 'Test-password-123!');
    state.authError = null;
    fireEvent.click(screen.getByRole('button', {name:'Hủy đặt lại mật khẩu'}));
    await screen.findByRole('heading', {name:'Quản trị CMS'});
    assert.equal(passwordRecovery.getSnapshot().status, 'idle');
    assert.deepEqual(state.authCalls[1], {method:'signOut',payload:{scope:'local'}});
    assert.equal(screen.getByLabelText('Mật khẩu').value, '');
});

test('expired sessions return to email recovery; ordinary login errors never leave a spinner', async () => {
    recover(); view(); fillPasswords();
    state.authError = {status:401,code:'session_not_found'};
    fireEvent.click(screen.getByRole('button', {name:'Lưu mật khẩu mới'}));
    await screen.findByRole('heading', {name:'Quên mật khẩu'});
    assert.match(screen.getByRole('alert').textContent, /hết hạn/);
    fireEvent.click(screen.getByRole('button', {name:'Quay lại đăng nhập'}));
    state.authError = null; state.authThrows = true;
    fireEvent.change(screen.getByLabelText('Email'), {target:{value:'test@example.com'}});
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {target:{value:'Test-password-123!'}});
    fireEvent.click(screen.getByRole('button', {name:'Đăng nhập',exact:true}));
    await screen.findByRole('alert');
    await waitFor(() => assert.equal(screen.getByRole('button', {name:'Đăng nhập',exact:true}).disabled, false));
    act(() => emitAuth('SIGNED_IN', {user:{id:'test-user'}}));
    assert.equal(screen.queryByRole('heading', {name:'Đặt mật khẩu mới'}), null);
});
