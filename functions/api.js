const serverless = require('serverless-http');
const app = require('../app'); // Assuming this is your full Express app

module.exports.serverlessHandler = serverless(app);