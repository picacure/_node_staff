module.exports = JSON.parse(require('fs').readFileSync(__dirname + '/../package.json')).version;