# Khôi phục mật khẩu CMS

Updated: 2026-10-25. Implemented by Codex for the founder's password recovery request.

1. Mở `/admin/login`, chọn **Quên mật khẩu?**.
2. Nhập email đã đăng ký và gửi yêu cầu. Kiểm tra Inbox và Spam. Thông báo gửi yêu cầu không xác nhận tài khoản có tồn tại.
3. Mở link trong email. Website hiển thị **Đặt mật khẩu mới** sau khi Supabase xác minh phiên khôi phục.
4. Nhập mật khẩu ít nhất 8 ký tự và xác nhận lại. Chính sách bổ sung do Supabase áp dụng; form hiển thị hướng dẫn khi bị từ chối.
5. Lưu thành công rồi chọn **Vào CMS**. Mật khẩu mới chỉ được người dùng nhập trên website.

Link hết hạn hoặc phiên không hợp lệ: quay lại bước 1 để lấy link mới. Hủy đặt lại mật khẩu sẽ đăng xuất phiên khôi phục trên trình duyệt hiện tại.

## Implementation and configuration

- Existing Supabase email/password auth and `/admin/login` callback remain in use. Configure the production Site URL and allow `https://mind-transform.vercel.app/admin/login` in Supabase Auth Redirect URLs. If Supabase falls back to the site root, the global tracker routes a verified recovery session to the form.
- The eagerly loaded `passwordRecovery` service captures `PASSWORD_RECOVERY` before lazy routes mount. A normal sign-in does not activate password editing. Auth callbacks remain synchronous; password updates run only on form submission via `auth.updateUser`.
- Only recovery intent tied to the authenticated user ID is stored in sessionStorage. No passwords, reset links or auth tokens are added to application storage/logs by this feature. Supabase's own session storage remains managed by its SDK.
- A same-tab refresh can restore a confirmed recovery session. Storage-disabled browsers still support the initial flow. Pending callbacks time out with a retry message; invalid/expired links never authorize updates by themselves.
- Network failures release the loading state and preserve form input for retry. Successful updates clear password inputs and recovery intent; the authenticated user can continue into CMS.
- No database schema, user provisioning, admin privileges or RLS policies change.

## Verification and limits

All 47 automated checks and the clean production build passed: 25 API/data/helper tests and 22 component tests. Recovery coverage includes early events, fallback root routing, refresh, ordinary sign-in separation, disabled storage, expiry, mismatch, update failures, cancellation and network retries.

Real email delivery and an actual password change require the account owner. Saved browser permissions deny the production origin; no live authenticated browser or pixel verification is claimed. The local checkout has no configured public Supabase key, so no recovery email was requested from the local environment. Use the deployed form with its production configuration.

References: [Supabase password recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), [updateUser](https://supabase.com/docs/reference/javascript/auth-updateuser).
