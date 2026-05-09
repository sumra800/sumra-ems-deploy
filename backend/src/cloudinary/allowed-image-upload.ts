import { BadRequestException } from '@nestjs/common';

/** Browser/clients typically send jpg as image/jpeg */
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/svg+xml',
]);

export function assertAllowedImageMime(mimetype: string | undefined, fieldLabel: string): void {
  if (!mimetype || !ALLOWED_IMAGE_MIME_TYPES.has(mimetype)) {
    throw new BadRequestException(
      `${fieldLabel} must be one of: SVG, PNG, JPG, or JPEG.`,
    );
  }
}
