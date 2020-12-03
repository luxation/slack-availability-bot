require('dotenv').config();
const {App} = require('@slack/bolt');

const DB = require('better-sqlite3-helper');

const axios = require('axios');

const jokesApi = 'https://geek-jokes.sameerkumar.website/api?format=json';

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

bot.command('/jarvis', async ({command, ack, say}) => {
    await ack();
    let user = DB().queryFirstRow('SELECT * FROM users WHERE identity=?', command.user_id);
    switch (command.text.trim().toLowerCase()) {
        case 'in':
            if (user) {
                await say(`Hey <@${command.user_id}> you're already in!`);
            } else {
                DB().insert('users', {identity: command.user_id, username: command.user_name});
                await say(`<@${command.user_id}> is in da :house:!`);
            }
            break;
        case 'out':
            if (user) {
                DB().delete('users', {identity: command.user_id});
                await say(`<@${command.user_id}> is done for the day!`);
            } else {
                await say(`Hey <@${command.user_name}>, have you tuned in beforehand?`);
            }
            break;
        case 'list':
            let allUsers = DB().query('SELECT * FROM users');
            await say(allUsers.length > 0 ? `Here is the list of available users:\r\n` + allUsers.map((u) => `- <@${u.identity}>\r\n`).join('') : 'No one is available at the moment.');
            break;
        case 'joke':
            let joke = await fetchRandomJoke();
            await say(joke);
            break;
        default:
            await say('I am not programmed to understand this command yet :(');
            break;
    }
});

const fetchRandomJoke = async () => {
    const res = await axios.get(jokesApi);
    if(res.status === 200) {
        return res.data['joke'];
    }
    return 'Well... that is awkward. I\'m out of jokes :(';
};

(async () => {
    // Start the app
    await bot.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
})();
