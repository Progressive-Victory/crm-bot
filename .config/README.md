# Setup Insteructions #

This project utizies the following software
- [Visual Studio Code](https://github.com/microsoft/vscode)
- [Node.js LTS Iron](https://github.com/nodejs/node/releases/tag/v20.9.0)
  - Pakages:
    - [Yarn](https://github.com/yarnpkg/yarn)
    - [TypeScript](https://github.com/microsoft/TypeScript)

## Windows ##

Run the below command to install all software nessisary to run this project
```pwsh
winget configuration -f ".\configuration.dsc.yaml" --accept-configuration-agreements
```

## .env ##

Copy `./.env.sample` to a file `./.env` with the then edit the following vaules to be actruate
```txt
TOKEN=<BOT TOKEN>
TEST_GUILD=<TEST GUILD ID>
TRACKING_GUILD=<TEST GUILD ID>
DB_URI=<MONGO TEST URI>
ERROR_WEBHOOK=<GET WEBHOOK FROM LOG CHANNEL IN TEST SERVER>
```

## sme.json ##

After the first build of the project copy [sme.json](https://github.com/Progressive-Victory/crm-bot/edit/v20-LTS-update/.config/SME.json) to `./dist` code will not run with out this file
