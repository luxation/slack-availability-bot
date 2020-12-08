# Slack Availability Bot

This bot manages users availability in your slack workspace.

## Installation

Clone this repository, then follow the instructions below.

```bash
git clone git@github.com:luxation/slack-availability-bot.git

npm install
```

## Use the bot as a nodeJS app

The bot uses an SQLite Database to store user data. You can modify this as you see fit.

To test the bot locally, create a .env file in the root folder.

```.env
SLACK_BOT_TOKEN=<BOT_TOKEN>
SLACK_SIGNING_SECRET=<SIGNING_SECRET>
BOT_COMMAND=<COMMAND_NAME>
PORT=<YOUR_PORT>
```

Then run the following command to start the app:

```bash
npm run start
```

You can then use ngrok or anything similar to tunnel your localhost 
to an online IP for testing.

## Use the bot as a firebase cloud function

The firebase cloud function will communicate with cloud firestore
to create, update and retrieve data.

You must create a new firestore collection called "users" on firebase console.

### Setup

Use node 12.x and its corresponding npm.

```bash
npm install -g firebase-tools

firebase login

firebase init # Init firebase (follow the instructions)

firebase functions:config:set slack.signing_secret=xxx
firebase functions:config:set slack.bot_token=xoxb-111-111-xxx
firebase functions:config:set bot.command=xxxx # Set your command
firebase functions:config:set cloud.region=xxxx # Set your region
```

### How to run the app locally

```bash
cd functions
npm i
cd -
firebase functions:config:get > .runtimeconfig.json
firebase serve
```

### How to deploy

```bash
firebase deploy
```

## Slack Usage

To use the bot on slack, add the bot to any slack channel and write the 
following command:

```text
/YOUR_BOT_COMMAND "in | out | list | joke"

For example:
/bot in -> notifies the bot that you are available
/bot out -> notifies the bot that your are unavailable
/bot list -> see who is available
/bot joke -> the bot will throw a random geek joke
```

NB: You can also communicate with the bot in PM.
