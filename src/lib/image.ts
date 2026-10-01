// Wikimedia only serves thumbnails at a fixed list of widths and answers other
// widths with HTTP 400 (320 and 640 fail), so requests snap to these.
export const THUMB_WIDTHS = [330, 500, 960, 1280] as const;

const COMMONS_ORIGINAL =
  /^https:\/\/upload\.wikimedia\.org\/(wikipedia\/[a-z-]+)\/([0-9a-f])\/([0-9a-f]{2})\/([^/?#]+)$/;

// Raster formats whose thumbnail keeps the original filename; SVG thumbnails are
// PNGs. Anything else (TIFF, PDF, ...) has its own naming rules and is left alone.
const SAME_NAME = /\.(jpe?g|png|gif|webp)$/i;
const SVG = /\.svg$/i;

/**
 * Returns a Wikimedia thumbnail URL at the smallest standard width of at least
 * `width`, or the input unchanged when it is not a full-size Commons URL (other
 * hosts, existing /thumb/ URLs, unsupported formats, anything unparseable).
 * Safe to run in the browser. Keep the original URL for full-size viewing.
 */
export function thumbUrl(url: string | null | undefined, width: number): string | null {
  if (!url) return null;
  const match = COMMONS_ORIGINAL.exec(url);
  if (!match || !Number.isFinite(width) || width <= 0) return url;
  const [, project, a, ab, file] = match;
  const suffix = SVG.test(file) ? ".png" : SAME_NAME.test(file) ? "" : null;
  if (suffix === null) return url;
  const w = THUMB_WIDTHS.find((t) => t >= width) ?? THUMB_WIDTHS[THUMB_WIDTHS.length - 1];
  return `https://upload.wikimedia.org/${project}/thumb/${a}/${ab}/${file}/${w}px-${file}${suffix}`;
}
