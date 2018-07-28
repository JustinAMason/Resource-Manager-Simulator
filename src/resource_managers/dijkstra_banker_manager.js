const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class DijkstraBankerManager extends ResourceManager {

	constructor(config) {
		super(config);
		this.header = "Dijkstra's Banker Resource Manager Simulation";
	}

	//private method
	initiate(taskID) {
		if (this.isFulfillableTask(taskID)) {
			this.reportInitiation(taskID);
		} else {
			this.handleAbortion(taskID, "initiation");
		}
	}

	//private method
	isFulfillableTask(taskID) {
		const [tasks, resources, isValidClaim] = [this.tasks, this.resources, this.isValidClaim];
		return Object.keys(this.resources).reduce(function(fulfillable, resourceID) {
			return isValidClaim(tasks, taskID, resources, resourceID) ? fulfillable : false;
		}, true);
	}

	//private method
	isValidClaim(tasks, taskID, resources, resourceID) {
		return tasks[taskID][resourceID]["needs"] <= resources[resourceID];
	}

	//private method
	processRequest(taskID, resourceID, unitsRequested, action) {
		if (this.isValidRequest(taskID, resourceID, unitsRequested)) {
			this.handleValidRequest(taskID, resourceID, unitsRequested, action);
		} else {
			this.handleAbortion(taskID, "request");
		}
	}

	//private method
	isValidRequest(taskID, resourceID, unitsRequested) {
		return unitsRequested <= this.tasks[taskID][resourceID]["needs"];
	}

	//private method
	handleValidRequest(taskID, resourceID, unitsRequested, action) {
		if (this.isFulfillableRequest(unitsRequested, resourceID)) {
			this.handleFulfillableRequest(taskID, resourceID, unitsRequested, action);
		} else {
			this.rejectRequest(taskID, resourceID, unitsRequested);
		}
	}

	//private method
	handleFulfillableRequest(taskID, resourceID, unitsRequested, action) {
		if (this.isSafeRequest(action)) {
			this.approveRequest(taskID, resourceID, unitsRequested);
		} else {
			this.rejectRequest(taskID, resourceID, unitsRequested, "unsafe");
		}
	}

	// private method
	isCompleteable(resources, tasks, taskID) {
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
			}
		});

		if (requestsRemaining === 0) {
			return(false);
		}

		return(unsatisfiableNeeds === 0);
	}

	//private method
	isFulfillableRequest(unitsRequested, resourceID) {
		return unitsRequested <= this.resources[resourceID];
	}

	// private method
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
		const isValidClaim = this.isValidClaim;

		Object.keys(potentialTasks).forEach(function(taskID) {
			if (isCompleteable(potentialResources, potentialTasks, taskID)) {
				numCompleteableTasks += 1;
			}
		});



		return(numCompleteableTasks > 0);

	}

	// private method
	deadlocked() {
		return(this.blockedQueue.size() > 0 && this.nonblockedQueue.size() === 0 && !this.areResourcesPending());
	}

};