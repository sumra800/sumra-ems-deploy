/** Allowed profile/symbol uploads: SVG, PNG, JPG/JPEG */
const EXT_PATTERN = /\.(svg|png|jpe?g)$/i;
const MIME_TYPES = new Set(['image/svg+xml', 'image/png', 'image/jpeg']);

export function isAllowedRasterOrSvgFile(file: File): boolean {
  if (file.type && MIME_TYPES.has(file.type)) return true;
  return EXT_PATTERN.test(file.name);
}

export const PROFILE_PHOTO_ACCEPT =
  '.svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg';
