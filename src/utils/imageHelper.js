export const getGoogleDriveImageUrl = (url) => {
    if (!url) return null;

    // Nếu không phải link Google Drive thì trả về nguyên gốc
    if (!url.includes('drive.google.com')) return url;

    try {
        // Tìm ID của file
        let id = '';
        const parts = url.split('/');

        // Trường hợp: .../file/d/FILE_ID/view...
        const dIndex = parts.indexOf('d');
        if (dIndex !== -1 && dIndex < parts.length - 1) {
            id = parts[dIndex + 1];
        }
        // Trường hợp: ...id=FILE_ID...
        else if (url.includes('id=')) {
            const match = url.match(/id=([a-zA-Z0-9_-]+)/);
            if (match) id = match[1];
        }

        if (id) {
            return `https://lh3.googleusercontent.com/d/${id}`;
        }
    } catch (e) {
        console.error("Error parsing Google Drive URL:", e);
    }

    return url;
};
