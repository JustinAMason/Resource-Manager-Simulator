const projectRunConfig = require(__dirname + "/config/project_run_config.js");
const activities_reader = require(__dirname + "/file_handling/activities_reader.js");
const resources_reader = require(__dirname + "/file_handling/resources_reader.js");
const tasks_reader = require(__dirname + "/file_handling/tasks_reader.js");
const Logger = require(__dirname + "/logger/logger.js");
const Queue = require(__dirname + "/task_handling/queue.js");

const commandLineConfig = projectRunConfig.getConfig(process.argv); //eslint-disable-line

const detailsLogger = new Logger(commandLineConfig);

const resources = resources_reader.getResources(commandLineConfig);

let tasks = tasks_reader.getTasks(commandLineConfig);
tasks = activities_reader.addActivitiesToTasks({commandLineConfig, tasks});

const queue = new Queue(tasks);

console.log();