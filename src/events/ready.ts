import Logger from '../structures/Logger';

export default async function onReady() {
	Logger.info(`Ready! Logged in as ${this.user.tag}`);
}
