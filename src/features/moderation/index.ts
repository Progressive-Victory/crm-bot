
/**
 *
 * @param a
 * @param b
 * @returns
 */
export function dateDiffInDays(a:Date, b: Date): number {
 const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

/**
 * The number of embeds that will show when viewing warning. Value can not be greater than 5. This is a Discord limit
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export const numberOfWarnEmbedsOnPage = 3
