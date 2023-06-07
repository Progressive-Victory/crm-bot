/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { join } from 'path';
import { config } from 'dotenv';
import { Client } from '../src/Client';

config();

describe('Client works', () => {
	test('The client throws with no options provided', () => {
		expect(() => {
			// @ts-ignore
			const client = new Client();
		}).toThrow();
	});

	test('Token should exist', () => {
		expect(process.env.TOKEN).toBeTruthy();
	});

	test('The client should not throw with minimal amount of options provided', async () => {
		const client = new Client({ intents: [] });

		await expect(
			(async () => client.init({
				eventPath: join(__dirname, '..', 'src', 'events'),
				commandPath: join(__dirname, '..', 'src', 'commands', 'chat', 'builders')
			}))()
		).resolves.not.toThrow();
	});
});
