const projectRunConfig = require("./config/project_run_config");
const copier = require("./copying/copier");
const activities_reader = require("./file_handling/activities_reader");
const resources_reader = require("./file_handling/resources_reader");
const tasks_reader = require("./file_handling/tasks_reader");
const Logger = require("./logger/logger");
const BankerManager = require("./resource_managers/dijkstra_banker_manager");
const OptimisticManager = require("./resource_managers/optimistic_manager");
const Queue = require("./task_handling/queue");

runProgram();

// BEGIN public interface

function runProgram() {
	const commandLineConfig = projectRunConfig.getConfig(process.argv); //eslint-disable-line
	const detailsLogger = new Logger(commandLineConfig);
	const resources = resources_reader.getResources(commandLineConfig);
	const [optimisticTasks, bankerTasks] = copier.copyObject(
		activities_reader.addActivitiesToTasks(
			{ commandLineConfig, "tasks": tasks_reader.getTasks(commandLineConfig) }
		),
		2
	);
	const [optimisticQueue, bankerQueue] = copier.copyInstance(Queue, optimisticTasks, 2);
	const optimisticManager = new OptimisticManager({detailsLogger, resources, "queue": optimisticQueue, "tasks": optimisticTasks});
	const bankerManager = new BankerManager({detailsLogger, resources, "queue": bankerQueue, "tasks": bankerTasks});

	runManagers([optimisticManager, bankerManager]);
	reportResults([optimisticTasks, bankerTasks], ["Optimistic", "Dijkstra's Banker"]);
}

// END public interface

function runManagers(managers) {
	managers.forEach(function(manager) {
		manager.run();
	});
}

function reportResults(tasksPerManager, manager_types) {
	tasksPerManager.forEach(function(managerTasks, index) {
		reportManagerResults(managerTasks, manager_types[index]);
	});
}

function reportManagerResults(tasks, manager_type) {
	const resultsLogger = new Logger({"show_output": true});

	resultsLogger.log();
	resultsLogger.logHeader(`${manager_type} Resource Manager Results`);

	Object.keys(tasks).forEach(function(taskID) {
		reportTaskResult(resultsLogger, tasks, taskID);
	});
	
	reportManagerSummary(resultsLogger, getCompletionTime(tasks), countAbortions(tasks));
}

function reportTaskResult(logger, tasks, taskID) {
	if (isAbortion(tasks, taskID)) {
		reportTaskAbortion(logger, taskID);
	} else {
		reportTaskCompletion(logger, tasks, taskID);
	}
}

function isAbortion(tasks, taskID) {
	return tasks[taskID]["status"] === "aborted";
}

function reportTaskAbortion(logger, taskID) {
	logger.log(`Task #${taskID} was aborted.`);
}

function reportTaskCompletion(logger, tasks, taskID) {
	const waitPercentage = getWaitPercentage(tasks[taskID]["wait"], tasks[taskID]["time"]);
	logger.log(`Task #${taskID} finished after ${tasks[taskID]["time"]} cycle(s). It waited for ${tasks[taskID]["wait"]} cycle(s) in total (${waitPercentage}%).`);
}

function getWaitPercentage(waitTime, totalTime) {
	return ((+waitTime / +totalTime) * 100).toFixed(0);
}

function reportManagerSummary(logger, completionTime, numAbortions) {
	logger.log();
	logger.log(`This manager finished after ${completionTime} cycle(s).`);
	logger.log(`${numAbortions} task(s) were aborted.`);
	logger.log();
	logger.log();
}

function getCompletionTime(tasks) {
	return Object.keys(tasks).reduce(function(time, taskID) {
		return Math.max(time, tasks[taskID]["time"]);
	}, 0);
}

function countAbortions(tasks) {
	return Object.keys(tasks).reduce(function(count, taskID) {
		return isAbortion(tasks, taskID) ? count + 1 : count;
	}, 0);
}
