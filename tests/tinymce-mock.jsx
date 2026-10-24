import React from 'react';
export function Editor({value,onEditorChange}) { return <textarea aria-label="Nội dung soạn thảo" value={value} onChange={event=>onEditorChange(event.target.value)} />; }
