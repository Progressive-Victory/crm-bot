# Localization

This folder contains an implementations of [Project Fluent](https://github.com/projectfluent/fluent.js)

## How to use

In your main file call the init function.

```ts
import { init } from './i18n';

init(path: string, options?: { hasGlobal?: boolean, fallback: Locale });
```

This function sets the file  path where Localization files are stored and additional options:

`hasGlobal`: if a `global.ftl` file in present in your Localization directory

`fallback`: default language

### Translation

translation options

```ts
interface tOptions {
    key: string
    ns?: string
    ons?: string
    locale?: Locale | LocaleString
    args?: Record<string, FluentVariable>
}
```

#### Example

key: `command-name`,
namespace: `command`,
locale: fallback language

```ts
t({ key: 'command-name', ns: 'command' }
```

key: `count-reply`,
namespace: `count`,
locale: locale of the interaction
args: username and length

```ts
t({
    locale: interaction.locale,
    key: 'count-reply',
    ns: 'count',
    args: {
        'username': message.author.username,
        'length':length.toString(),
    }
})
```

#### Debugging

If you see the following error:

```bash
  [cause]: [
    ReferenceError: Unknown variable: $channel
        at resolveVariableReference (/d/bots/crm-bot/node_modules/@fluent/bundle/index.js:213:31)
        at resolveExpression (/d/bots/crm-bot/node_modules/@fluent/bundle/index.js:181:24)
        at resolveComplexPattern (/d/bots/crm-bot/node_modules/@fluent/bundle/index.js:349:25)
        at FluentBundle.formatPattern (/d/bots/crm-bot/node_modules/@fluent/bundle/index.js:702:29)
        at i18n.t (/d/bots/crm-bot/dist/i18n/i18n.js:104:28)
        at t (/d/bots/crm-bot/dist/i18n/index.js:32:17)
        at renameOrganizing (/d/bots/crm-bot/dist/structures/helpers.js:264:41)
        at Event.onReady [as execute] (/d/bots/crm-bot/dist/events/ready.js:43:49)
        at ExtendedClient.<anonymous> (/d/bots/crm-bot/dist/Client/Client.js:170:56)
        at Object.onceWrapper (node:events:640:26)
  ]
```

Then you are missing `args` in your translation function.
In this case, the solution would be:

```ts
t({
    key: 'vc-rename-error',
    locale: channel.guild.preferredLocale,
    ns: 'lead',
    args: { channel: channel.name } // Add this object
})
```
