import { TimeStyle } from './types';

export declare const TimeStyles: {
	ShortDate: 'd';
	LongDatez: 'D';
	ShortTime: 't';
	LongTime: 'T';
	ShortDateTime: 'f';
	LongDateTime: 'F';
	RelativeTime: 'R';
};

// Implimentation of the Date Prototype addtional function of toDiscordString
// eslint-disable-next-line func-names
Date.prototype.toDiscordString = function(this: Date, style?: TimeStyle) {
	// Round the Number of milliseconds to seconds
	const code = Math.floor(this.getTime() / 1000);

	// If a style is not present return formated timestamp with out style
	// Note: This defaults to ShortDate/Time
	if (!style) return `<t:${code}>`;
	return `<t:${code}:${style}>`;
};
