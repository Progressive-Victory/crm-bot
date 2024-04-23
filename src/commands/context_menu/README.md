# Context Menus
[Context menus](https://discordjs.guide/interactions/context-menus.html) are an intutive we to add adtional functionality to a bot. These commands have two types `User` and `Message`.


## Create a Chat Command object
1. Create a new file
	- `builder` - The discord.js [Context Menu buider](https://discordjs.dev/docs/packages/builders/main/ContextMenuCommandBuilder:Class)
	- `execute` - The fuction that will be run on the comand interation
	- `guildIds` - An arry of server IDs *Only use if the command will be exclusive to a set of servers*
```ts
// src/commands/context_menu/user.ts
import { ApplicationCommandType } from 'discord.js';
import { ContextMenuCommand } from '../../Classes/index.js';

export default new ContextMenuCommand()
	.setBuilder(builder => builder
		.setName('user')
		.setType(ApplicationCommandType.User))
	.setExecute(async (interaction) => {
		/* Some Code */
	});
```
2. Add export to command `index.ts`
```ts
// src/commands/index.ts
export { default as user } from './context_menu/user.js';
```
3. Load commands into the client in main
```ts
// src/index.ts
import { Client } from './Classes/index.js';
import * as commands from './commands/index.js';

const client = new Client();

// Load commands 
for (const command of Object.values(commands)) 
	client.commands.add(command);
```
