/**
 *
 * @param pageStart
 * @param length
 * @returns
 */
export function isRightArrowDisabled(pageStart:number, length:number) {
	return pageStart + 3 > length
}
