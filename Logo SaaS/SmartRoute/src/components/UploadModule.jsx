import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { useOrderContext } from '../context/OrderContext';
import { motion } from 'framer-motion';

const UploadModule = ({ onUploadSuccess }) => {
    const { setRawHeaders, setOrders } = useOrderContext();
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;

        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
            setError('Invalid file type. Please upload Excel or CSV.');
            return;
        }

        setLoading(true);
        setError('');
        setFileName(file.name);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 2) {
                setError('File is empty or missing headers.');
                setLoading(false);
                return;
            }

            const headers = jsonData[0];
            const rows = jsonData.slice(1);

            // Filter out empty rows
            const validRows = rows.filter(row => row.some(cell => cell !== undefined && cell !== ''));

            setRawHeaders(headers);
            const jsonDataObjects = XLSX.utils.sheet_to_json(worksheet);
            setOrders(jsonDataObjects);

            if (onUploadSuccess) onUploadSuccess();

        } catch (err) {
            console.error(err);
            setError('Error parsing file. Please check the format.');
        } finally {
            setLoading(false);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragging
                        ? 'border-[var(--primary)] bg-blue-50'
                        : 'border-[var(--border)] bg-white hover:border-[var(--primary)]'
                    }
        `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => handleFile(e.target.files[0])}
                />

                <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full ${fileName ? 'bg-green-100 text-[var(--success)]' : 'bg-blue-100 text-[var(--primary)]'}`}>
                        {fileName ? <CheckCircle size={32} /> : <FileSpreadsheet size={32} />}
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-[var(--text-main)]">
                            {fileName ? 'File Selected' : 'Upload Order List'}
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-6">
                            {fileName ? fileName : 'Drag & drop your Excel/CSV file here, or click to browse'}
                        </p>
                    </div>

                    {!fileName && (
                        <label
                            htmlFor="file-upload"
                            className="btn-primary"
                        >
                            <Upload size={18} />
                            Choose File
                        </label>
                    )}

                    {loading && <p className="text-[var(--primary)] animate-pulse">Processing file...</p>}

                    {error && (
                        <div className="flex items-center gap-2 text-[var(--error)] bg-red-50 px-4 py-2 rounded-lg mt-4 border border-red-100">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default UploadModule;
