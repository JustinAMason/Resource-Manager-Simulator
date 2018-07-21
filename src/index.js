const projectRunConfig = require(__dirname + "/config/project_run_config.js");
const resource_reader = require(__dirname + "/file_handling/resource_reader.js");
const Logger = require(__dirname + "/logger/logger.js");

const commandLineConfig = projectRunConfig.getConfig(process.argv); //eslint-disable-line

const resultsLogger = new Logger({"detailed_output": true});
const detailsLogger = new Logger(commandLineConfig);

const resources = resource_reader.getResources(commandLineConfig);

console.log(resources);