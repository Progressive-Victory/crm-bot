/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { join } from 'path';
import { config } from 'dotenv';
import { ExtendedClient } from '../src/Client/Client';

config();

describe('Client works', () => {
	test('The client throw with no options provided', () => {
		expect(() => {
			// @ts-ignore
			const client = new ExtendedClient();
		}).toThrow();
	});

	test('Token exists', () => {
		expect(process.env.TOKEN).toBeTruthy();
	});

	test('The client should not throw with minimal amount of options provided', async () => {
		const client = new ExtendedClient({ intents: [] });

		await expect(
			(async () => client.init({
				eventPath: join(__dirname, 'events'),
				commandPath: join(__dirname, 'commands')
			}))()
		).resolves.not.toThrow();
	});
});
