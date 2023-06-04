import { ChatInputCommand } from 'src/Client';
import { localization, t } from 'src/i18n';

export const ns = 'help';

export default new ChatInputCommand().setBuilder((builder) =>
	builder
		.setName(t({ key: 'command-name', ns }))
		.setDescription(t({ key: 'command-description', ns }))
		.setNameLocalizations(localization('command-name', ns))
		.setDescriptionLocalizations(localization('command-description', ns))
);
