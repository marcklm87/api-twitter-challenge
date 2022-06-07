require('dotenv').config()
// Open a realtime stream of Tweets, filtered according to rules
// https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/quick-start

const needle = require('needle');

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = process.env.TWITTER_BEARER_TOKEN;
console.log('token', token)
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';
//const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at&expansions=author_id&user.fields=created_at';
//const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id';

// this sets up two rules - the value is the search terms to match on, and the tag is an identifier that
// will be applied to the Tweets return to show which rule they matched
// with a standard project with Basic Access, you can add up to 25 concurrent rules to your stream, and
// each rule can be up to 512 characters long

// Edit rules as desired below
const rules = [
    { value: 'coding' },
    { value: 'animales' },
    { value: 'mexico' },
];

async function getAllRules() {

    const response = await needle('get', rulesURL, {
        headers: {
            "authorization": `Bearer ${token}`
        }
    })

    if (response.statusCode !== 200) {
        console.log("Error:", response.statusMessage, response.statusCode)
        throw new Error(response.body);
    }

    return (response.body);
}

async function deleteAllRules(rules) {

    if (!Array.isArray(rules.data)) {
        return null;
    }

    const ids = rules.data.map(rule => rule.id);

    const data = {
        "delete": {
            "ids": ids
        }
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`
        }
    })

    if (response.statusCode !== 200) {
        throw new Error(response.body);
    }

    return (response.body);

}

async function setRules() {

    const data = {
        "add": rules
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`
        }
    })

    if (response.statusCode !== 201) {
        throw new Error(response.body);
    }

    return (response.body);

}

async function setNewRules(newsRules) {

    const data = {
        "add": newsRules
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${token}`
        }
    })

    if (response.statusCode !== 201) {
        throw new Error(response.body);
    }

    return (response.body);

}

const changeRules  = async (newTopics) => {
    let currentRules 
    try {
         //   Get all stream rules
        currentRules = await getAllRules()

        // Delete all stream rules
        await deleteAllRules(currentRules)

        // Set rules based on array above
        let newRules = []
        newTopics.forEach(element => {
            newRules.push({'value': element})
        });
        await setNewRules(newRules)
    } catch (error) {
        console.log('Error en set new Rules', error)
    }
}


async function streamConnect(retryAttempt, socket ) {
    await setRules()
    const stream = needle.get(streamURL, {
        headers: {
            // "User-Agent": "v2FilterStreamJS",
            "Authorization": `Bearer ${token}`
        },
        // timeout: 20000
    });
    // console.log('llamamos funcion', stream)
    stream.on('data', data => {
        try {
            const json = JSON.parse(data);
            // A successful connection resets retry count.
            console.log('Respuesta', json)
            socket.emit("message", JSON.stringify(json))
            retryAttempt = 0;
        } catch (e) {
            //console.log('error', e)
            if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
                console.log('Stream', data.detail)
                process.exit(1)
            } else {
                // Keep alive signal received. Do nothing.
            }
        }
    }).on('err', error => {
        if (error.code !== 'ECONNRESET') {
            console.log('error ECONNRESET', error.code);
            process.exit(1);
        } else {
            // This reconnection logic will attempt to reconnect when a disconnection is detected.
            // To avoid rate limits, this logic implements exponential backoff, so the wait time
            // will increase if the client cannot reconnect to the stream. 
            setTimeout(() => {
                console.warn("A connection error occurred. Reconnecting...")
                streamConnect(++retryAttempt);
            }, 2 ** retryAttempt)
        }
    });

    return stream;

}


module.exports = {
    streamConnect, 
    changeRules,
    getAllRules
}