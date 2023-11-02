# Setup Insteructions #

This project utilizes the following software:

- [Visual Studio Code](https://github.com/microsoft/vscode)
- [Node.js LTS Iron](https://github.com/nodejs/node/releases/tag/v20.9.0)
  - Pakages:
    - [Yarn](https://github.com/yarnpkg/yarn)
    - [TypeScript](https://github.com/microsoft/TypeScript)

## Windows ##

Run the below command in PowerShell to install all of the software necessary to run this project.

```pwsh
winget configuration -f ".\configuration.dsc.yaml" --accept-configuration-agreements
```

### .env ###

Copy `./.env.sample` to a file `./.env` then edit the following vaules to be actruate:

```txt
TOKEN=<BOT TOKEN>
TEST_GUILD=<TEST GUILD ID>
TRACKING_GUILD=<TEST GUILD ID>
DB_URI=<MONGO TEST URI>
ERROR_WEBHOOK=<GET WEBHOOK FROM LOG CHANNEL IN TEST SERVER>
```

The following PowerShell will copy the file

```pwsh
copy ./.env.sample ./.env
```

### Runing the Bot ###

To run the bot the following actions must be completed:

First Install all dependencies

```pwsh
yarn install
```

Then build the bot's in the `./dist` folder

```pwsh
yarn build
```

After that move `sme.json` to `./dist/sme.json` files exsits as describe in above sections.

Finaly run the bot

```pwsh
yarn dev
```

If the bot fails to run check that `.env` and `./dist/sme.json`.
