import { EmbedBuilder, WebhookClient } from 'discord.js';
import pino from 'pino';

async function webHookErrBot(args: unknown) {
	if (!process.env.ERROR_WEBHOOK) return null;

	const errBot = new WebhookClient({ url: process.env.ERROR_WEBHOOK });

	await args;

	const getStackTrace = (input) => {
		let stack = '';
		for (const arg of input) {
			if (arg instanceof Error) {
				stack = arg.stack;
				break;
			}
		}
		return stack;
	};

	const embed = new EmbedBuilder()
		.setTitle('Error detected')
		.setDescription(`Error was detected: ${args} \n Stack trace: ${getStackTrace(args)}`)
		.setColor(0xff0000);

	return errBot
		.send({
			content: '<@879086334835298375>',
			username: 'Error Bot',
			avatarURL: process.env.ERROR_IMAGE,
			embeds: [embed]
		})
		.catch((error) => {
			// eslint-disable-next-line no-console
			console.error(error);
		});
}

function wrap(logger: pino.Logger) {
	const { error, child } = logger;

	function errorRearranger(...args) {
		if (typeof args[0] === 'string' && args.length > 1) {
			for (let i = 1; i < args.length; i++) {
				const arg = args[i];
				if (arg instanceof Error) {
					const [err] = args.splice(i, 1);
					args.unshift(err);
				}
			}
		}

		webHookErrBot(args);

		return error.apply(this, args);
	}

	function childModifier(...args) {
		const c = child.apply(this, args);
		c.error = errorRearranger;
		c.child = childModifier;
		return c;
	}

	logger.error = errorRearranger.bind(logger);
	logger.child = childModifier.bind(logger);
	return logger;
}

export const Logger = wrap(
	pino({
		level: process.env.LOG_LEVEL || 'debug',
		hooks: {
			logMethod(inputArgs, method, level) {
				if (level === 50 && (inputArgs[0] as unknown) instanceof Error) {
					const err = inputArgs[0] as unknown as Error;
					let args = [];

					if (err.cause) {
						let str = err.stack;
						if (err.cause) {
							str += `\nCaused by: ${err.cause[0]} ${err.cause[0]?.stack}`;
						}
						args = [str];
					}
					else {
						args = [err.stack];
					}

					return method.apply(this, args);
				}

				// Handles additional arguments being passed in
				for (let i = 0; i < inputArgs.length; ++i) {
					if (Array.isArray(inputArgs[i])) {
						inputArgs[i] = inputArgs[i].join(' ');
					}

					if (i !== 0) {
						inputArgs[0] += ` ${inputArgs[i]}`;
					}
				}

				return method.apply(this, inputArgs);
			}
		}
	})
);

export default Logger;
