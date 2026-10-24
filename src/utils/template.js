export function normalizeTemplate(row) {
    return { ...row, thumbnail: row.thumbnail || row.image || '',
        template_link: row.template_link || row.lark_link || '' };
}
