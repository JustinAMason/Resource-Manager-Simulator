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

	request(action) {
		
		const taskID = action["taskID"];
		const task = this.tasks[taskID];

		if (task["status"] === "delayed") {
			this.handleDelay(task);
		} else {
			this.handleRequest(action);
		}

	}

	release(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];

		if (task["status"] === "delayed") {
			this.handleDelay(task);
		} else {
			this.handleRelease(action);
		}

	}

	handleRelease(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];
		const resourceID = action["resourceID"];
		const unitsWaived = action["quantity"];
		const delay = action["delay"];

		if (delay > 0) {
			task["delay"] = +delay;
			action["delay"] -= 1;
			task["status"] = "delayed";
			this.handleDelay(taskID);
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

	handleTermination(action) {
		const taskID = action["taskID"];
		const task = this.tasks[taskID];
		const delay = action["delay"];

		if (delay > 0) {
			task["delay"] = +delay;
			action["delay"] -= 1;
			task["status"] = "delayed";
			this.handleDelay(taskID);
		} else {
			task["status"] = "terminated";
		task["time"] = this.curCycle;
		this.logger.log(`${this.curCycle}: Task #${taskID} has been terminated`);
		}

	}

	abort(taskID) {
		const task = this.tasks[taskID];
		task["status"] = "aborted";
		this.releaseResources(taskID);
	}

	handleDeadlock() {

		const taskIDs = this.blockedQueue.getSortedTaskIDs();

		while (taskIDs.length > 1) {
			const taskID = taskIDs[0];
			this.abort(taskID);
			taskIDs.shift();
			this.logger.log(`${this.curCycle}: DEADLOCK! Task #${taskID} aborted`);
		}

		this.blockedQueue.set(taskIDs);

	}

	handleDelay(taskID) {
		const task = this.tasks[taskID];
		task["delay"] -= 1;
		this.logger.log(`${this.curCycle}: Task #${taskID} delayed (${task["delay"]} cycle(s) left)`);
	}

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

	updateStatus(taskID) {

		const task = this.tasks[taskID];

		if (task["status"] !== "terminated" && task["status"] !== "aborted") {
			task["status"] = task["delay"] === 0 ? "ready" : "blocked";
		}

	}

	updateQueue() {

		while (!this.blockedQueue.isEmpty()) {
			this.queue.add(this.blockedQueue.remove());
		}

		while (!this.nonblockedQueue.isEmpty()) {
			this.queue.add(this.nonblockedQueue.remove());
		}

	}

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

};