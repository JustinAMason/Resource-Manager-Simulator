const projectRunConfig = require(__dirname + "/config/project_run_config.js");
const file_reader = require(__dirname + "/file_handling/file_reader.js");
const Logger = require(__dirname + "/logger/logger.js");

const commandLineConfig = projectRunConfig.getConfig(process.argv); //eslint-disable-line

const resultsLogger = new Logger({"detailed_output": true});
const detailsLogger = new Logger(commandLineConfig);

const getResourcesAvailability = file_reader.getResourcesAvailable(commandLineConfig);
