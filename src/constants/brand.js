/**
 * MINDTRANSFORM BRAND ASSETS KIT (v1.0)
 */

// 1. BẢNG MÀU CHUẨN (COLOR PALETTE)
export const THEME = {
    colors: {
        bg: "#020719",        // Deep Space Blue (Nền chính)
        primary: "#2DE1C2",   // Cyber Cyan (Nút, Điểm nhấn)
        secondary: "#5B67C9", // Digital Purple (Phụ trợ)
        text: "#FFFFFF",      // Off-White (Chữ)
        textMuted: "#A0AEC0"  // Cool Grey (Chữ mờ)
    },
    fonts: {
        main: "'Plus Jakarta Sans', sans-serif"
    }
};

// 2. LOGO ASSETS (SVG CODE)
export const LOGOS = {
    // Logo ngang đầy đủ - Dùng cho Header / Navigation Bar
    // Lưu ý: "fill='currentColor'" giúp logo tự đổi màu theo text cha (trắng hoặc đen)
    horizontal: `
    <svg width="180" height="36" viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;800&display=swap');</style>
        <text x="0" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="40" fill="currentColor">Mind</text>
        <circle cx="105" cy="35" r="5" fill="#2DE1C2" />
        <text x="118" y="45" font-family="'Plus Jakarta Sans', sans-serif" font-weight="400" font-size="40" fill="currentColor">Transform</text>
    </svg>
    `,

    // Biểu tượng vuông - Dùng cho Favicon hoặc Mobile Menu
    symbol: `
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#020719"/>
        <text x="50" y="75" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="80" fill="white" text-anchor="middle">M</text>
        <circle cx="75" cy="25" r="10" fill="#2DE1C2" stroke="#020719" stroke-width="4"/>
    </svg>
    `
};
