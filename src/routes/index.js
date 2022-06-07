const credentials = require('./credentials');
const stream = require('./stream');
const modules = [
    credentials,
    stream
]
// change url
module.exports = modules;