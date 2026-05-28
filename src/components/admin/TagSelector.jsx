import React from 'react';

/**
 * Reusable pill-toggle tag selector for Skills editor and MindAI intake form.
 * Props:
 *   label: string — section label
 *   options: string[] — available tags
 *   selected: string[] — currently selected tags
 *   onChange: (newSelected: string[]) => void
 *   columns: number — grid columns (default 3)
 */
export default function TagSelector({ label, options, selected = [], onChange, columns = 3 }) {
    const toggle = (tag) => {
        if (selected.includes(tag)) {
            onChange(selected.filter(t => t !== tag));
        } else {
            onChange([...selected, tag]);
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-xs font-medium text-slate-400 mb-2">{label}</label>
            )}
            <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {options.map(tag => {
                    const isSelected = selected.includes(tag);
                    return (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggle(tag)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                                isSelected
                                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {tag}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
