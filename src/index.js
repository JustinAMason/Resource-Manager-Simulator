const projectRunConfig = require(__dirname + "/config/project_run_config.js");
const activities_reader = require(__dirname + "/file_handling/activities_reader.js");
const resources_reader = require(__dirname + "/file_handling/resources_reader.js");
const tasks_reader = require(__dirname + "/file_handling/tasks_reader.js");
const Logger = require(__dirname + "/logger/logger.js");
const OptimisticManager = require(__dirname + "/resource_managers/optimistic_manager.js");
const Queue = require(__dirname + "/task_handling/queue.js");

function run() {
	const optimistic = new OptimisticManager({detailsLogger, resources, queue, tasks});
	optimistic.run();
}

function showResults(tasks) {

	const resultsLogger = new Logger({"show_output": true});

	resultsLogger.log();
	resultsLogger.logHeader("Optimistic Resource Manager Results");

	let completionTime = 0;
	let numAbortions = 0;

	Object.keys(tasks).forEach(function(taskID) {
		const task = tasks[taskID];
		const status = task["status"];
		const time = task["time"];
		const wait = task["wait"];

		if (status === "aborted") {
			numAbortions += 1;
			console.log(`Task #${taskID} was aborted.`);
		} else {
			completionTime = Math.max(completionTime, time);
			console.log(`Task #${taskID} finished after ${time} cycle(s). It waited for ${wait} cycle(s) in total (${((wait / time) * 100).toFixed(0)}%).`);
		}

	});

	console.log();
	console.log(`This manager finished after ${completionTime} cycle(s).`);
	console.log(`${numAbortions} task(s) were aborted.`);

	console.log();
	resultsLogger.logHeaderBreak();
	console.log();

}

const commandLineConfig = projectRunConfig.getConfig(process.argv); //eslint-disable-line
const detailsLogger = new Logger(commandLineConfig);
const resources = resources_reader.getResources(commandLineConfig);

let optimisticTasks = tasks_reader.getTasks(commandLineConfig);
optimisticTasks = activities_reader.addActivitiesToTasks({commandLineConfig, "tasks": optimisticTasks});

let bankerTasks = tasks_reader.getTasks(commandLineConfig);
bankerTasks = activities_reader.addActivitiesToTasks({commandLineConfig, "tasks": bankerTasks});

const optimisticQueue = new Queue(optimisticTasks);
const bankerQueue = new Queue(bankerTasks);

const optimisticManager = new OptimisticManager({detailsLogger, resources, "queue": optimisticQueue, "tasks": optimisticTasks});
optimisticManager.run();

showResults(optimisticTasks);
