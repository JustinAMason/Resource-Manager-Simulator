const commandLineConfig = require(__dirname + "/config/run_config.js");
const Logger = require(__dirname + "/logger/logger.js");

const runConfig = commandLineConfig.getConfig(process.argv); //eslint-disable-line

const resultsLogger = new Logger({"detailed_output": true});
const detailsLogger = new Logger(runConfig);