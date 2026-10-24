export function normalizePost(post) {
    const image=post.image ?? post.cover_image ?? '';
    return {...post,image,cover_image:image};
}
