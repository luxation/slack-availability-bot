require('dotenv').config();
const {App} = require('@slack/bolt');

const DB = require('better-sqlite3-helper');

// The first call creates the global instance with your settings
DB({
    path: './data/sqlite3.db', // this is the default
    readonly: false, // read only
    fileMustExist: false, // throw error if database not exists
    WAL: true, // automatically enable 'PRAGMA journal_mode = WAL'
    migrate: {  // disable completely by setting `migrate: false`
        force: false, // set to 'last' to automatically reapply the last migration-file
        table: 'migration', // name of the database table that is used to keep track
        migrationsPath: './migrations' // path of the migration-files
    }
});

const bot = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN
});

bot.event("app_mention", async ({context, event}) => {
    const command = event.text.split(">")[1].trim().toLowerCase();

    if (command === 'in') {
        let user = DB().queryFirstRow('SELECT * FROM users WHERE username=? AND channel=?', [event.user, event.channel]);
        if (user) {
            reply(context, event, `Hey <@${event.user}> you're already in!`);
        } else {
            DB().insert('users', {username: event.user, channel: event.channel});
            reply(context, event, `Hey <@${event.user}> thanks for tuning in. Have a nice working day!`);
        }

    } else if (command === 'out') {
        let user = DB().queryFirstRow('SELECT * FROM users WHERE username=? AND channel=?', [event.user, event.channel]);
        if (user) {
            DB().delete('users', {username: event.user, channel: event.channel});
            reply(context, event, `Hope you had a productive day! See you soon <@${event.user}>.`);
        } else {
            reply(context, event, `Hey <@${event.user}>, have you tuned in beforehand?`);
        }
    } else if (command === 'list') {
        let allUsers = DB().query('SELECT * FROM users');
        reply(context, event, allUsers.length > 0 ? `Here is the list of available people here in <#${event.channel}>\r\n` + allUsers.map((u) => `- <@${u.username}>\r\n`) : 'No one is available at the moment.')
    }
});

const reply = async (context, event, message) => {
    try {
        await bot.client.chat.postMessage({
            token: context.botToken,
            channel: event.channel,
            text: message
        });
    } catch (e) {
        console.log(`error responding ${e}`);
    }
};

(async () => {
    // Start the app
    await bot.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
})();
