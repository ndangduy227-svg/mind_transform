import React from 'react';
import { motion } from 'framer-motion';

export default function UnderstandingScore({ score }) {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-20 h-20">
            {/* Background Circle */}
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-slate-800"
                />
                {/* Progress Circle */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className="text-teal-500"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-sm font-bold text-white">{score}%</span>
                <span className="text-[8px] text-slate-400 uppercase tracking-wider">Hiểu</span>
            </div>
        </div>
    );
}
