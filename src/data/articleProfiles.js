import { decodeDocument } from '../utils/editorialDocument';

// Every article derives its presentation from its saved document, independent of slug.
export function articleProfile(post) {
    const decoded=decodeDocument(post?.content);
    if(decoded.kind!=='structured')return null;
    const doc=decoded.document;
    return {
        document:doc,format:doc.format,label:doc.hero.label,title:(doc.hero.title || post.title || '').split('\n'),lead:doc.hero.lead,
        heroMode:doc.hero.coverMode,coverCaption:doc.hero.caption,disclosure:doc.hero.disclosure,
        workflow:doc.blocks.find(block=>block.type==='workflow')?.steps || [],
        nextTitle:doc.cta.title,nextCopy:doc.cta.body,
    };
}
