/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import CustomClient from '../src/structures/CustomClient';

describe('Client works', () => {
	test('The client throw with no options provided', () => {
		expect(() => {
			// @ts-ignore
			const client = new CustomClient();
		}).toThrow();
	});

	test('The client should not throw with minimal amount of options provided', () => {
		expect(() => {
			const client = new CustomClient({
				token: 'token',
				intents: [],
				commandsDir: 'commands',
				eventsDir: 'events',
				interactionsDir: 'interactions'
			});
		}).not.toThrow();
	});
});
