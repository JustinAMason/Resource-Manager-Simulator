const Queue = require(__dirname + "/../task_handling/queue.js");
module.exports =

class ResourceManager {

	constructor(config) {
		this.resources = config["resources"];
		this.pendingResources = {};
		this.logger = config["detailsLogger"];
		this.queue = config["queue"];
		this.nonblockedQueue = new Queue();
		this.blockedQueue = new Queue();
		this.tasks = config["tasks"];
		this.curCycle = 0;
	}

	run() {

		this.logger.logHeader(this.header);
		this.logger.log();

		while (!this.queue.isEmpty()) {

			this.showResourcesAvailable();
			
			while (!this.queue.isEmpty()) {
				this.runCycle();
			}

			if (this.deadlocked()) {
				this.handleDeadlock();
			}

			this.curCycle += 1;

			this.updateQueue();
			this.updateResources();

			this.logger.log();

		}

	}

	// private method
	runCycle() {

		const taskID = this.queue.remove();
		const task = this.tasks[taskID];
		const activities = task["activities"];
		const activity = activities[0];

		const action = activity["action"];

		/* eslint-disable indent */
		switch (action) {
			case "initiate": this.initiate(taskID); break;
			case "request": this.request(activity); break;
			case "release": this.release(activity); break;
			case "terminate": this.terminate(activity); break;
			default: break;
		}

		if (task["status"] !== "blocked" && task["status"] !== "delayed") {
			activities.shift();
		}

		this.updateQueues(taskID);
		this.updateStatus(taskID);

	}

	//private method
	reportInitiation(taskID) {
		this.logger.log(`${this.curCycle}: Task #${taskID} initiated`);
	}

	// private method
	request(action) {
		
		const taskID = action["taskID"];
		const task = this.tasks[taskID];

		if (task["status"] === "delayed") {
			this.handleDelay(task);
		} else {
			this.handleRequest(action);
		}

	}

	// private method
	handleRequest(action) {
		const [taskID, resourceID, unitsRequested, delay] = [
			action["taskID"], action["resourceID"], action["quantity"], action["delay"]
		];
		const task = this.tasks[taskID];

		if (this.isDelayed(delay)) {
			this.processDelay(taskID, action, delay);
		} else {
			this.processRequest(taskID, resourceID, unitsRequested, action);
		}
	}

	// private method
	release(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];

		if (task["status"] === "delayed") {
			this.handleDelay(task);
		} else {
			this.handleRelease(action);
		}

	}

	// private method
	handleRelease(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];
		const resourceID = action["resourceID"];
		const unitsWaived = action["quantity"];
		const delay = action["delay"];

		if (this.isDelayed(delay)) {
			this.processDelay(taskID, action, delay);
		} else {
			if (unitsWaived <= task[resourceID]["has"]) {
				this.exchangeUnits({"recipient": "manager", task, resourceID, "quantity": unitsWaived});
				this.logger.log(`${this.curCycle}: Task #${taskID} releases ${unitsWaived} R${resourceID}`);
			} else {
				task["status"] = "blocked";
				this.logger.log(`${this.curCycle}: Task #${taskID} cannot release ${unitsWaived} R${resourceID} (more than owned)`);
			}
		}

	}

	// private method
	terminate(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];

		if (task["status"] === "delayed") {
			this.handleDelay(task);
		} else {
			this.releaseResources(taskID);
			this.handleTermination(action);
		}

	}

	// private method
	handleTermination(action) {
		const taskID = action["taskID"];
		const task = this.tasks[taskID];
		const delay = action["delay"];

		if (this.isDelayed(delay)) {
			this.processDelay(taskID, action, delay);
		} else {
			task["status"] = "terminated";
			task["time"] = this.curCycle;
			this.logger.log(`${this.curCycle}: Task #${taskID} has been terminated`);
		}

	}

	// private method
	abort(taskID) {
		const task = this.tasks[taskID];
		task["status"] = "aborted";
		this.releaseResources(taskID);
	}

	// private method
	handleDeadlock() {

		const taskIDs = this.blockedQueue.getSortedTaskIDs();

		while (taskIDs.length > 1) {
			this.handleAbortion(taskIDs[0], "deadlock");
			taskIDs.shift();
		}

		this.blockedQueue.set(taskIDs);

	}

	// private method
	handleDelay(taskID) {
		const task = this.tasks[taskID];
		task["delay"] -= 1;
		this.logger.log(`${this.curCycle}: Task #${taskID} delayed (${task["delay"]} cycle(s) left)`);
	}

	// private method
	exchangeUnits(exchange) {

		const recipient = exchange["recipient"];
		const task = exchange["task"];
		const resourceID = exchange["resourceID"];
		const quantity = +exchange["quantity"];

		if (recipient === "task") {
			task[resourceID]["has"] = +task[resourceID]["has"] + quantity;
			task[resourceID]["needs"] = +task[resourceID]["needs"] - quantity;
			this.resources[resourceID] = +this.resources[resourceID] - quantity;
		} else if (recipient === "manager") {

			task[resourceID]["has"] = +task[resourceID]["has"] - quantity;
			task[resourceID]["needs"] = +task[resourceID]["needs"] + quantity;

			if (!this.pendingResources[resourceID]) {
				this.pendingResources[resourceID] = 0;
			}

			this.pendingResources[resourceID] += quantity;

		}

	}

	// private method
	releaseResources(taskID) {

		const task = this.tasks[taskID];
		const keysToIgnore = ["activities", "delay", "time", "wait", "status"];

		const resourceIDs = Object.keys(task).filter(function(key) {
			return !keysToIgnore.includes(key);
		});

		for (let i = 0; i < resourceIDs.length; i++) {
			const resourceID = resourceIDs[i];
			const unitsToRelease = task[resourceID]["has"];
			this.exchangeUnits({"recipient": "manager", task, resourceID, "quantity": unitsToRelease});
		}

	}

	// private method
	updateResources() {

		const resources = this.resources;
		const pendingResources = this.pendingResources;

		Object.keys(this.pendingResources).forEach(function(resourceID) {
			resources[resourceID] += pendingResources[resourceID];
		});

		Object.keys(this.pendingResources).forEach(function(resourceID) {
			pendingResources[resourceID] = 0;
		});

	}

	// private method
	showResourcesAvailable() {

		const resources = this.resources;

		let output = "AVAILABLE: ";
		Object.keys(this.resources).forEach(function(resourceID) {
			output += output === "AVAILABLE: " ? "": ", ";
			output += `R${resourceID} (${resources[resourceID]})`;
		});

		this.logger.log(output);
		this.logger.logLine();
		
	}

	// private method
	updateStatus(taskID) {

		const task = this.tasks[taskID];

		if (task["status"] !== "terminated" && task["status"] !== "aborted") {
			task["status"] = task["delay"] === 0 ? "ready" : "blocked";
		}

	}

	// private method
	updateQueue() {

		while (!this.blockedQueue.isEmpty()) {
			this.queue.add(this.blockedQueue.remove());
		}

		while (!this.nonblockedQueue.isEmpty()) {
			this.queue.add(this.nonblockedQueue.remove());
		}

	}

	// private method
	updateQueues(taskID) {

		const task = this.tasks[taskID];
		const activities = task["activities"];

		if (!activities.length == 0) {
			switch (task["status"]) {
				case "ready": this.nonblockedQueue.add(taskID); break;
				case "delayed": this.nonblockedQueue.add(taskID); break;
				case "blocked": this.blockedQueue.add(taskID); break;
				default: break;
			}
		}

	}

	// private method
	areResourcesPending() {

		const pendingResources = this.pendingResources;

		let numResourcesWithUnitsPending = 0;
		Object.keys(this.pendingResources).forEach(function(resource) {
			if (+pendingResources[resource] > 0) {
				numResourcesWithUnitsPending += 1;
			}
		});

		if (numResourcesWithUnitsPending > 0) {
			return(true);
		}

		return(false);

	}

	//private method
	processDelay(taskID, activity, delay) {
		this.tasks[taskID]["delay"] = +delay;
		activity["delay"] -= 1;
		this.tasks[taskID]["status"] = "delayed";
		this.handleDelay(taskID, activity);
	}

	//private method
	isDelayed(delay) {
		return delay > 0;
	}

	//private method
	approveRequest(taskID, resourceID, unitsRequested) {
		const task = this.tasks[taskID];
		this.exchangeUnits({"recipient": "task", task, resourceID, "quantity": unitsRequested});
		this.reportRequestApproval(taskID, unitsRequested, resourceID);
	}

	//private method
	reportRequestApproval(taskID, unitsRequested, resourceID) {
		this.logger.log(`${this.curCycle}: Task #${taskID} granted ${unitsRequested} R${resourceID}`);
	}

	//private method
	rejectRequest(taskID, resourceID, unitsRequested, unsafeRequest) {
		this.tasks[taskID]["status"] = "blocked";
		this.tasks[taskID]["wait"] += 1;
		this.reportRequestRejection(taskID, unitsRequested, resourceID, unsafeRequest);
	}

	//private method
	reportRequestRejection(taskID, unitsRequested, resourceID, unsafeRequest) {
		let output = `${this.curCycle}: Task #${taskID} NOT granted ${unitsRequested} R${resourceID}`;
		output += unsafeRequest ? " (unsafe request)" : "";
		this.logger.log(output);
	}

	//private method
	isFulfillableRequest(unitsRequested, resourceID) {
		return unitsRequested <= this.resources[resourceID];
	}

	//private method
	handleAbortion(taskID, context) {
		this.abort(taskID);
		this.reportAbortion(taskID, context);
	}

	//private method
	reportAbortion(taskID, context) {
		const messages = {
			"initiation": `${this.curCycle}: Task #${taskID} aborted (impossible to fulfill)`,
			"request": `${this.curCycle}: Task #${taskID} aborted (requested more than needed)`,
			"deadlock": `${this.curCycle}: DEADLOCK! Task #${taskID} aborted`
		};
		this.logger.log(messages[context]);
	}

};