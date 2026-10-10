import { fallbackUrl } from './pagesRouting';

const target: string | null = fallbackUrl(window.location.href, import.meta.env.BASE_URL);
if (target !== null) { window.location.replace(target); }
