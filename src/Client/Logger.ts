import { EmbedBuilder, WebhookClient } from 'discord.js';
import pino from 'pino';

async function webHookErrBot(args: unknown){
	const errBot = new WebhookClient({ url: 'https://discord.com/api/webhooks/1126064927765966890/RTYdcnpjLfHEExcBpGMX-EiSKzPF6JRtcwzAzL-IB58pGNsFR0l0wannj9W_qVq1hbu1' });
	
	await args;

	const embed = new EmbedBuilder()
		.setTitle('Error Detectet')
		.setDescription(`Error was detected ${args}`)
		.setColor(0xFF0000);

	errBot.send({
		content: '<@879086334835298375>',
		username: 'Error Bot',
		avatarURL: 'https://img.freepik.com/premium-vector/error-chatbot-glyph-icon-silhouette-symbol-talkbot-with-error-speech-bubble-error-bot_123447-1535.jpg',
		embeds: [embed]
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
						args = [`${err.stack}\nCaused by: ${err.cause[0]} ${err.cause[0].stack}`];
					}
					else {
						args = [err.stack];
					}
					
					return method.apply(this, args) ;
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
