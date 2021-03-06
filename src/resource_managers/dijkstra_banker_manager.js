const ResourceManager = require("./resource_manager.js");

module.exports =

class DijkstraBankerManager extends ResourceManager {

	// BEGIN public interface

	constructor(config) {
		super(config);
		this.header = "Dijkstra's Banker Resource Manager Simulation";
	}

	// END public interface

	initiate(taskID) {
		if (this.isFulfillableTask(taskID)) {
			this.reportInitiation(taskID);
		} else {
			this.handleAbortion(taskID, "initiation");
		}
	}

	isFulfillableTask(taskID) {
		let fulfillable = true;
		for (let i = 0; i < Object.keys(this.resources).length; i++) {
			const resourceID = Object.keys(this.resources)[i];
			fulfillable = fulfillable && this.isValidClaim(taskID,resourceID);
		}
		return fulfillable;
	}

	isValidClaim(taskID, resourceID, tasksGiven, resourcesGiven) {
		const tasks = tasksGiven ? tasksGiven : this.tasks;
		const resources = resourcesGiven ? resourcesGiven : this.resources;
		return tasks[taskID][resourceID]["needs"] <= resources[resourceID];
	}

	processRequest(taskID, resourceID, unitsRequested, action) {
		if (this.isValidRequest(taskID, resourceID, unitsRequested)) {
			this.handleValidRequest(taskID, resourceID, unitsRequested, action);
		} else {
			this.handleAbortion(taskID, "request");
		}
	}

	isValidRequest(taskID, resourceID, unitsRequested) {
		return unitsRequested <= this.tasks[taskID][resourceID]["needs"];
	}

	handleValidRequest(taskID, resourceID, unitsRequested, action) {
		if (this.isFulfillableRequest(unitsRequested, resourceID)) {
			this.handleFulfillableRequest(taskID, resourceID, unitsRequested, action);
		} else {
			this.rejectRequest(taskID, resourceID, unitsRequested);
		}
	}

	handleFulfillableRequest(taskID, resourceID, unitsRequested, action) {
		if (this.isSafeRequest(action)) {
			this.approveRequest(taskID, resourceID, unitsRequested);
		} else {
			this.rejectRequest(taskID, resourceID, unitsRequested, "unsafe");
		}
	}

	isCompleteable(potentialResources, potentialTasks, taskID) {
		const resourceIDs = this.getResourceIDs(taskID);

		let completeable = true;
		for (let i = 0; i < resourceIDs.length; i++) {
			completeable = completeable && this.isValidClaim(taskID, resourceIDs[i], potentialTasks, potentialResources);
		}

		return(completeable && this.requestsPending(potentialTasks[taskID]["activities"]));
	}

	isSafeRequest(request) {
		const [taskID, resourceID, quantity] = [request["taskID"], request["resourceID"], request["quantity"]];
		const potentialResources = this.getPotentialResources(resourceID, quantity);
		const potentialTasks = this.getPotentialTasks(taskID, resourceID, quantity);

		let safe = false;
		for (let i = 0; i < Object.keys(potentialTasks).length; i++) {
			const taskID = Object.keys(potentialTasks)[i];
			safe = safe || this.isCompleteable(potentialResources, potentialTasks, taskID);
		}
		
		return(safe);
	}

	getPotentialResources(resourceID, unitsWaived) {
		const potentialResources = JSON.parse(JSON.stringify(this.resources));
		potentialResources[resourceID] -= unitsWaived;
		return potentialResources;
	}

	getPotentialTasks(taskID, resourceID, unitsReceived) {
		const potentialTasks = JSON.parse(JSON.stringify(this.tasks));
		potentialTasks[taskID][resourceID]["has"] = +potentialTasks[taskID][resourceID]["has"] + unitsReceived;
		potentialTasks[taskID][resourceID]["needs"] = +potentialTasks[taskID][resourceID]["needs"] - unitsReceived;
		return(potentialTasks);
	}

	deadlocked() {
		return(this.blockedQueue.size() > 0 && this.nonblockedQueue.size() === 0 && !this.areResourcesPending());
	}

};