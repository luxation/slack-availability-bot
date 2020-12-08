const functions = require('firebase-functions');
const config = functions.config();

const {App, ExpressReceiver} = require('@slack/bolt');

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

const axios = require('axios');

const jokesApi = 'https://geek-jokes.sameerkumar.website/api?format=json';

const expressReceiver = new ExpressReceiver({
    signingSecret: config.slack.signing_secret,
    endpoints: '/events',
    processBeforeResponse: true,
});

const app = new App({
    receiver: expressReceiver,
    token: config.slack.bot_token,
    processBeforeResponse: true,
});

// Global Error Handler
app.error(console.log);

app.command(`/${config.bot.command}`, async ({command, ack, say}) => {
    await ack();
    const docRef = db.collection('users');
    const userRef = docRef.doc(command.user_id);
    const userRefGet = await userRef.get();
    const user = userRefGet.exists ? {...userRefGet.data()} : null;
    switch (command.text.trim().toLowerCase()) {
        case 'in':
            if (user) {
                if (user.available) {
                    await say(`Hey <@${command.user_id}> you're already in!`);
                } else {
                    await userRef.update({username: command.user_name, available: true});
                    await say(`<@${command.user_id}> is in da :house:!`);
                }
            } else {
                await docRef.doc(command.user_id).set({username: command.user_name, available: true});
                await say(`<@${command.user_id}> is in da :house:!`);
            }
            break;
        case 'out':
            if (user && user.available) {
                await userRef.update({username: command.user_name, available: false});
                await say(`<@${command.user_id}> is done for the day!`);
            } else {
                await say(`Hey <@${command.user_id}>, have you tuned in beforehand?`);
            }
            break;
        case 'list':
            let querySnapshot = await docRef.where('available', '==', true).get();
            await say(querySnapshot.docs.length > 0 ? `Here is the list of available users:\r\n` + querySnapshot.docs.map((doc) => `- <@${doc.id}>\r\n`).join('') : 'No one is available at the moment.');
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
    if (res.status === 200) {
        return res.data['joke'];
    }
    return 'Well... that is awkward. I\'m out of jokes :(';
};

// https://{your domain}.cloudfunctions.net/slack/events
exports.slack = functions.region(config.cloud.region).https.onRequest(expressReceiver.app);


