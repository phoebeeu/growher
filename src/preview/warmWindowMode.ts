export function isWarmWindowPreview(search: string): boolean {
  return new URLSearchParams(search).get('preview') === 'warm-window';
}
