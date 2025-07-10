import GhostContentAPI from "@tryghost/content-api";

export async function getPosts(ghost_api_key: string, ghost_domain: string) {
  const api = new GhostContentAPI({
    url: ghost_domain,
    key: ghost_api_key,
    version: "v5.0",
  });

  return await api.posts.browse({
    limit: "all",
    include: "tags",
    order: "published_at DESC",
  });
}
