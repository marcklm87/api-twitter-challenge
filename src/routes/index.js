const credentials = require('./credentials');
const catalog = require('./catalog');
const book = require('./book')
const modules = [
    credentials,
    catalog,
    book
]
// change url
module.exports = modules;