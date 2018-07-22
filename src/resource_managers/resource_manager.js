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

			this.curCycle += 1;

			this.updateQueue();
			this.updateResources();

			this.logger.log();

		}

		this.logger.logHeaderBreak();

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

		if (task["status"] !== "blocked") {
			activities.shift();
		}

		this.updateQueues(taskID);
		this.updateStatus(taskID);

	}

	initiate(taskID) {
		this.logger.log(`Task #${taskID} initiated`);
	}

	request(action) {
		
		const taskID = action["taskID"];
		const task = this.tasks[taskID];

		if (task["status"] === "blocked") {
			this.handleBlock(task);
		} else {
			this.handleRequest(action);
		}

	}

	release(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];

		if (task["status"] === "blocked") {
			this.handleBlock(task);
		} else {
			this.handleRelease(action);
		}

	}

	terminate(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];

		if (task["status"] === "blocked") {
			this.handleBlock(task);
		} else {
			this.handleTermination(action);
		}

	}

	handleRelease(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];
		const resourceID = action["resourceID"];
		const unitsWaived = action["quantity"];

		if (unitsWaived <= task[resourceID]["has"]) {
			this.exchangeUnits({"recipient": "manager", task, resourceID, "quantity": unitsWaived});
			this.logger.log(`${this.curCycle}: Task #${taskID} releases ${unitsWaived} R${resourceID}`);
		} else {
			task["status"] = "blocked";
			this.logger.log(`${this.curCycle}: Task #${taskID} cannot release ${unitsWaived} R${resourceID} (more than owned)`);
		}

	}

	handleTermination(action) {
		const taskID = action["taskID"];
		const task = this.tasks[taskID];

		task["status"] = "terminated";
		task["time"] = this.curCycle;
		this.logger.log(`${this.curCycle}: Task #${taskID} has been terminated`);

	}

	handleBlock(task) {
		task["delay"] -= 1;
		this.logger.log(`Task #${taskID} delayed (${task["delay"]} cycle(s) left)`);
	}

	exchangeUnits(exchange) {

		const recipient = exchange["recipient"];
		const task = exchange["task"];
		const resourceID = exchange["resourceID"];
		const quantity = +exchange["quantity"];

		if (recipient === "task") {
			task[resourceID]["has"] += quantity;
			task[resourceID]["needs"] -= quantity;
			this.resources[resourceID] -= quantity;
		} else if (recipient === "manager") {
			task[resourceID]["has"] -= quantity;
			this.pendingResources[resourceID] = quantity;
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
				case "blocked": this.blockedQueue.add(taskID); break;
				default: break;
			}
		}

	}

};