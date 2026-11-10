/**
 * EN/RU blogipostitused on eestikeelsed. Tagasta /et/blogi/[slug]
 * või null, kui tegu pole EN/RU postituse teega (nimekirjaleht jääb alles).
 */
export function etBlogPostPathFromLocalized(pathname: string): string | null {
  const match = pathname.match(/^\/(en|ru)\/blogi\/([^/]+)\/?$/)
  if (!match) return null
  return `/et/blogi/${match[2]}`
}
