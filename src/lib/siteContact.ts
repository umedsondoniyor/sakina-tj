/** Strip `tel:` for schema.org `telephone` and similar. */
export function telephoneDigitsFromHref(phoneHref: string): string {
  return phoneHref.replace(/^tel:/i, '').trim();
}
