const projectRunConfig = require(__dirname + "/config/project_run_config.js");
const activities_reader = require(__dirname + "/file_handling/activities_reader.js");
const resources_reader = require(__dirname + "/file_handling/resources_reader.js");
const tasks_reader = require(__dirname + "/file_handling/tasks_reader.js");
const Logger = require(__dirname + "/logger/logger.js");
const BankerManager = require(__dirname + "/resource_managers/dijkstra_banker_manager.js");
const OptimisticManager = require(__dirname + "/resource_managers/optimistic_manager.js");
const Queue = require(__dirname + "/task_handling/queue.js");

runProgram();

function runProgram() {
	const commandLineConfig = projectRunConfig.getConfig(process.argv); //eslint-disable-line
	const detailsLogger = new Logger(commandLineConfig);
	const resources = resources_reader.getResources(commandLineConfig);
	const [optimisticTasks, bankerTasks] = copyObject(
		activities_reader.addActivitiesToTasks(
			{ commandLineConfig, "tasks": tasks_reader.getTasks(commandLineConfig) }
		),
		2
	);
	const [optimisticQueue, bankerQueue] = copyInstance(Queue, optimisticTasks, 2);
	const optimisticManager = new OptimisticManager({detailsLogger, resources, "queue": optimisticQueue, "tasks": optimisticTasks});
	const bankerManager = new BankerManager({detailsLogger, resources, "queue": bankerQueue, "tasks": bankerTasks});

	runManagers([optimisticManager, bankerManager]);
	reportResults([optimisticTasks, bankerTasks], ["Optimistic", "Dijkstra's Banker"]);
}

//private method
function copyObject(object, quantity) {
	quantity = getCopyQuantity(quantity);

	const copies = [];
	for (let i = 0; i < quantity; i++) {
		copies.push(JSON.parse(JSON.stringify(object)));
	}

	return(copies);
}

//private method
function copyInstance(instance, instanceArgs, quantity) {
	quantity = getCopyQuantity(quantity);

	const copies = [];
	for (let i = 0; i < quantity; i++) {
		copies.push(new instance(instanceArgs));
	}

	return(copies);
}

//private method
function getCopyQuantity(quantity) {
	return quantity ? quantity : 1;
}

//private method
function runManagers(managers) {
	managers.forEach(function(manager) {
		manager.run();
	});
}

//private method
function reportResults(tasksPerManager, manager_types) {
	tasksPerManager.forEach(function(managerTasks, index) {
		reportManagerResults(managerTasks, manager_types[index]);
	});
}

//private method
function reportManagerResults(tasks, manager_type) {
	const resultsLogger = new Logger({"show_output": true});

	resultsLogger.log();
	resultsLogger.logHeader(`${manager_type} Resource Manager Results`);

	Object.keys(tasks).forEach(function(taskID) {
		reportTaskResult(resultsLogger, tasks, taskID);
	});
	
	reportManagerSummary(resultsLogger, getCompletionTime(tasks), countAbortions(tasks));
}

//private method
function reportTaskResult(logger, tasks, taskID) {
	if (isAbortion(tasks, taskID)) {
		reportTaskAbortion(logger, taskID);
	} else {
		reportTaskCompletion(logger, tasks, taskID);
	}
}

//private method
function isAbortion(tasks, taskID) {
	return tasks[taskID]["status"] === "aborted";
}

//private method
function reportTaskAbortion(logger, taskID) {
	logger.log(`Task #${taskID} was aborted.`);
}

//private method
function reportTaskCompletion(logger, tasks, taskID) {
	const waitPercentage = getWaitPercentage(tasks[taskID]["wait"], tasks[taskID]["time"]);
	logger.log(`Task #${taskID} finished after ${tasks[taskID]["time"]} cycle(s). It waited for ${tasks[taskID]["wait"]} cycle(s) in total (${waitPercentage}%).`);
}

//private method
function getWaitPercentage(waitTime, totalTime) {
	return ((+waitTime / +totalTime) * 100).toFixed(0);
}

//private method
function reportManagerSummary(logger, completionTime, numAbortions) {
	logger.log();
	logger.log(`This manager finished after ${completionTime} cycle(s).`);
	logger.log(`${numAbortions} task(s) were aborted.`);
	logger.log();
	logger.log();
}

//private method
function getCompletionTime(tasks) {
	return Object.keys(tasks).reduce(function(time, taskID) {
		return Math.max(time, tasks[taskID]["time"]);
	}, 0);
}

//private method
function countAbortions(tasks) {
	return Object.keys(tasks).reduce(function(count, taskID) {
		return isAbortion(tasks, taskID) ? count + 1 : count;
	}, 0);
}
