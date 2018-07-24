const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class DijkstraBankerManager extends ResourceManager {

	constructor(config) {
		super(config);
		this.header = "Dijkstra's Banker Resource Manager Simulation";
	}

	handleRequest(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];
		const resourceID = action["resourceID"];
		const unitsRequested = action["quantity"];
		const delay = action["delay"];

		if (delay > 0) {
			task["delay"] = +delay;
			action["delay"] -= 1;
			task["status"] = "delayed";
			this.handleDelay(taskID);
		} else {
			if (unitsRequested <= this.resources[resourceID]) {
				if (this.isSafeRequest(action)) {
					this.exchangeUnits({"recipient": "task", task, resourceID, "quantity": unitsRequested});
					this.logger.log(`${this.curCycle}: Task #${taskID} granted ${unitsRequested} R${resourceID}`);
				} else {
					task["status"] = "blocked";
					task["wait"] += 1;
					this.logger.log(`${this.curCycle}: Task #${taskID} NOT granted ${unitsRequested} R${resourceID} (unsafe request)`);
				}
			} else {
				task["status"] = "blocked";
				task["wait"] += 1;
				this.logger.log(`${this.curCycle}: Task #${taskID} NOT granted ${unitsRequested} R${resourceID}`);
			}
		}

	}

	isCompleteable(config) {

		const resources = config["resources"];
		const tasks = config["tasks"];
		const taskID = config["taskID"];
		const task = tasks[taskID];
		const keysToIgnore = ["activities", "delay", "time", "wait", "status"];

		const resourceIDs = Object.keys(task).filter(function(key) {
			return !keysToIgnore.includes(key);
		});

		let unsatisfiableNeeds = 0;
		resourceIDs.forEach(function(resourceID) {
			if (resources[resourceID] < task[resourceID]["needs"]) {
				unsatisfiableNeeds += 1;
			}
		});

		let requestsRemaining = 0;
		task["activities"].forEach(function(activity) {
			if (activity["action"] === "request") {
				requestsRemaining += 1;
			} else {
			}
		});

		if (requestsRemaining === 0) {
			return(false);
		}

		return(unsatisfiableNeeds === 0);

	}

	isSafeRequest(request) {

		const taskID = request["taskID"];
		const resourceID = request["resourceID"];
		const quantity = +request["quantity"];

		const potentialResources = Object.assign({}, this.resources);
		potentialResources[resourceID] -= quantity;

		const potentialTasks = JSON.parse(JSON.stringify(this.tasks));
		potentialTasks[taskID][resourceID]["has"] = +potentialTasks[taskID][resourceID]["has"] + quantity;
		potentialTasks[taskID][resourceID]["needs"] = +potentialTasks[taskID][resourceID]["needs"] - quantity;

		let numCompleteableTasks = 0;

		const tasks = this.tasks;
		const isCompleteable = this.isCompleteable;

		Object.keys(potentialTasks).forEach(function(taskID) {
			if (isCompleteable({"resources": potentialResources, "tasks": potentialTasks, taskID})) {
				numCompleteableTasks += 1;
			}
		});



		return(numCompleteableTasks > 0);

	}

	deadlocked() {
		return(this.blockedQueue.size() > 0 && this.nonblockedQueue.size() === 0 && !this.areResourcesPending());
	}

};