/** Append sizing/quality params to an images.unsplash.com URL. */
export function img(url: string, w = 800, h?: number) {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}auto=format&fit=crop&q=72&w=${w}${h ? `&h=${h}` : ''}`
}
