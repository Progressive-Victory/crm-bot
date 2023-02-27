import Logger from '../structures/Logger';

export default async function onReady() {
	Logger.info(`Ready! Logged in as ${this.user.tag}`);

	if (!process.env.TRACKING_GUILD) {
		Logger.error('Tracking guild not set. Exiting...');
		process.exit(1);
	}

	if (!this.guilds.cache.has(process.env.TRACKING_GUILD)) {
		Logger.error('Tracking guild not found. Exiting...');
		process.exit(1);
	}
}
