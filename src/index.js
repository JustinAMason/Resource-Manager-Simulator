const projectRunConfig = require(__dirname + "/config/project_run_config.js");
const activities_reader = require(__dirname + "/file_handling/activities_reader.js");
const resources_reader = require(__dirname + "/file_handling/resources_reader.js");
const tasks_reader = require(__dirname + "/file_handling/tasks_reader.js");
const Logger = require(__dirname + "/logger/logger.js");
const BankerManager = require(__dirname + "/resource_managers/dijkstra_banker_manager.js");
const OptimisticManager = require(__dirname + "/resource_managers/optimistic_manager.js");
const Queue = require(__dirname + "/task_handling/queue.js");

// TODO: Refactor this function
function showResults(config) {

	const tasks = config["tasks"];
	const manager_type = config["manager_type"];

	const resultsLogger = new Logger({"show_output": true});

	resultsLogger.log();
	resultsLogger.logHeader(`${manager_type} Resource Manager Results`);

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
	console.log();

}

function copyObject(object, quantity) {

	quantity = quantity ? quantity : 1;

	const copies = [];
	for (let i = 0; i < quantity; i++) {
		copies.push(JSON.parse(JSON.stringify(object)));
	}

	return(copies);

}

function copyInstance(instance, instanceArgs, quantity) {

	quantity = quantity ? quantity : 1;

	const copies = [];
	for (let i = 0; i < quantity; i++) {
		copies.push(new instance(instanceArgs));
	}

	return(copies);

}

function runManagers(managers) {
	managers.forEach(function(manager) {
		manager.run();
	});
}

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

	showResults({"tasks": optimisticTasks, "manager_type": "Optimistic"});
	showResults({"tasks": bankerTasks, "manager_type": "Dijkstra's Banker"});
}

runProgram();