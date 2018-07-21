const projectRunConfig = require(__dirname + "/config/project_run_config.js");
const resources_reader = require(__dirname + "/file_handling/resources_reader.js");
const tasks_reader = require(__dirname + "/file_handling/tasks_reader.js");
const Logger = require(__dirname + "/logger/logger.js");

const commandLineConfig = projectRunConfig.getConfig(process.argv); //eslint-disable-line

const resultsLogger = new Logger({"detailed_output": true});
const detailsLogger = new Logger(commandLineConfig);

const resources = resources_reader.getResources(commandLineConfig);
const tasks = tasks_reader.getTasks(commandLineConfig);