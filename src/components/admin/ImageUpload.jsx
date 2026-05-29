import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageLucide } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/**
 * Extract the storage path from a Supabase public URL.
 * Public URLs end with `/object/public/images/<path>`, so we split on that.
 */
function extractPathFromUrl(url) {
    const marker = '/object/public/images/';
    const idx = url.indexOf(marker);
    if (idx === -1) return '';
    return decodeURIComponent(url.slice(idx + marker.length));
}

export default function ImageUpload({
    value = '',
    onChange,
    folder = 'posts',
    label = 'Ảnh',
    className = '',
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const clearError = () => {
        if (error) setTimeout(() => setError(''), 3000);
    };

    const validate = (file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError('Chỉ chấp nhận PNG, JPEG, WebP hoặc GIF');
            clearError();
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError('Kích thước tối đa 5 MB');
            clearError();
            return false;
        }
        return true;
    };

    const uploadFile = async (file) => {
        if (!validate(file)) return;

        setUploading(true);
        setError('');

        try {
            const path = `${folder}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(path, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(path);
            onChange(data.publicUrl);
        } catch (err) {
            setError(err.message || 'Tải lên thất bại');
            clearError();
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!value) return;

        const path = extractPathFromUrl(value);
        if (path) {
            await supabase.storage.from('images').remove([path]);
        }
        onChange('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
        // Reset so the same file can be re-selected
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    const openPicker = () => {
        if (!uploading) inputRef.current?.click();
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-medium text-slate-400 mb-2">
                    {label}
                </label>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* --- Uploading state --- */}
            {uploading && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                    <span className="text-sm text-slate-400">Đang tải lên...</span>
                </div>
            )}

            {/* --- Has image state --- */}
            {!uploading && value && (
                <div
                    className="relative group cursor-pointer rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                    onClick={openPicker}
                >
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full max-h-[200px] object-cover rounded-xl"
                    />
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                        title="Xoá"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* --- No image / drop zone state --- */}
            {!uploading && !value && (
                <div
                    onClick={openPicker}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
                        dragActive
                            ? 'border-teal-500 bg-teal-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                >
                    {dragActive ? (
                        <ImageLucide className="h-8 w-8 text-teal-500" />
                    ) : (
                        <Upload className="h-8 w-8 text-slate-500" />
                    )}
                    <span className="text-sm text-slate-400">
                        Kéo thả hoặc nhấn để tải ảnh lên
                    </span>
                    <span className="text-xs text-slate-500">
                        PNG, JPEG, WebP, GIF &mdash; tối đa 5 MB
                    </span>
                </div>
            )}

            {/* --- Error message --- */}
            {error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}
