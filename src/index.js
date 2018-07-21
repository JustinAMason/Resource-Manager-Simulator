const commandLineConfig = require(__dirname + "/config/project_run_config.js");
const Logger = require(__dirname + "/logger/logger.js");

const projectRunConfig = commandLineConfig.getConfig(process.argv); //eslint-disable-line

const resultsLogger = new Logger({"detailed_output": true});
const detailsLogger = new Logger(projectRunConfig);