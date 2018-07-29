const Queue = require(__dirname + "/../task_handling/queue.js");
module.exports =

class ResourceManager {

	// BEGIN public interface

	constructor(config) {
		this.tasks = config["tasks"];
		[this.resources, this.pendingResources] = [config["resources"], {}];
		[this.queue, this.nonblockedQueue, this.blockedQueue] = [config["queue"], new Queue(), new Queue()];
		this.logger = config["detailsLogger"];
		this.curCycle = 0;
	}

	run() {
		this.logger.logHeader(this.header);
		this.logger.log();

		while (!this.queue.isEmpty()) {
			this.reportResourcesAvailability();
			
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

	// END public interface

	runCycle() {
		const taskID = this.queue.remove();
		const activities = this.tasks[taskID]["activities"];
		const activity = activities[0];
		const action = activity["action"];
		
		switch (action) { /* eslint-disable indent */
			case "initiate": this.initiate(taskID); break;
			case "request": this.request(activity); break;
			case "release": this.release(activity); break;
			case "terminate": this.terminate(activity); break;
			default: break;
		}

		if (this.isTaskReadyForNextActivity(taskID)) {
			activities.shift();
		}

		this.updateBlockedAndNonBlockedQueues(taskID);
		this.updateStatus(taskID);
	}

	isTaskReadyForNextActivity(taskID) {
		return this.tasks[taskID]["status"] !== "blocked" && this.tasks[taskID]["status"] !== "delayed";
	}

	reportInitiation(taskID) {
		this.logger.log(`${this.curCycle}: Task #${taskID} initiated`);
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
		const [taskID, resourceID, unitsWaived, delay] = [action["taskID"], action["resourceID"], action["quantity"], action["delay"]];
		const task = this.tasks[taskID];

		if (this.isDelayed(delay)) {
			this.processDelay(taskID, action, delay);
		} else {
			if (this.isValidRelease(taskID, resourceID, unitsWaived)) {
				this.performRelease(task, taskID, resourceID, unitsWaived);
			} else {
				this.rejectRelease(task, taskID, resourceID, unitsWaived);
			}
		}
	}

	performRelease(task, taskID, resourceID, unitsWaived) {
		this.exchangeUnits({"recipient": "manager", task, resourceID, "quantity": unitsWaived});
		this.logger.log(`${this.curCycle}: Task #${taskID} releases ${unitsWaived} R${resourceID}`);
	}

	rejectRelease(task, taskID, resourceID, unitsWaived) {
		task["status"] = "blocked";
		this.logger.log(`${this.curCycle}: Task #${taskID} cannot release ${unitsWaived} R${resourceID} (more than owned)`);
	}

	isValidRelease(taskID, resourceID, unitsWaived) {
		return unitsWaived <= this.tasks[taskID][resourceID]["has"];
	}

	terminate(action) {
		const taskID = action["taskID"];

		if (this.tasks[taskID]["status"] === "delayed") {
			this.handleDelay(this.tasks[taskID]);
		} else {
			this.releaseResources(taskID);
			this.handleTermination(action);
		}
	}

	handleTermination(action) {
		const [taskID, delay] = [action["taskID"], action["delay"]];

		if (this.isDelayed(delay)) {
			this.processDelay(taskID, action, delay);
		} else {
			this.terminateTask(taskID);
		}
	}

	terminateTask(taskID) {
		this.tasks[taskID]["status"] = "terminated";
		this.tasks[taskID]["time"] = this.curCycle;
		this.reportTermination(taskID);
	}

	reportTermination(taskID) {
		this.logger.log(`${this.curCycle}: Task #${taskID} has been terminated`);
	}

	abort(taskID) {
		const task = this.tasks[taskID];
		task["status"] = "aborted";
		this.releaseResources(taskID);
	}

	handleDeadlock() {
		const taskIDs = this.blockedQueue.getSortedTaskIDs();

		while (taskIDs.length > 1) {
			this.handleAbortion(taskIDs[0], "deadlock");
			taskIDs.shift();
		}

		this.blockedQueue.set(taskIDs);
	}

	handleDelay(taskID) {
		const task = this.tasks[taskID];
		task["delay"] -= 1;
		this.logger.log(`${this.curCycle}: Task #${taskID} delayed (${task["delay"]} cycle(s) left)`);
	}

	exchangeUnits(exchange) {
		const [recipient, task, resourceID, quantity] = [exchange["recipient"], exchange["task"], exchange["resourceID"], +exchange["quantity"]];

		if (recipient === "task") {
			this.transferUnitsToTask(task, resourceID, quantity);
		} else if (recipient === "manager") {
			this.transferUnitsFromTask(task, resourceID, quantity);
		}
	}

	transferUnitsToTask(task, resourceID, quantity) {
		task[resourceID]["has"] = +task[resourceID]["has"] + quantity;
		task[resourceID]["needs"] = +task[resourceID]["needs"] - quantity;
		this.resources[resourceID] = +this.resources[resourceID] - quantity;
	}

	transferUnitsFromTask(task, resourceID, quantity) {
		task[resourceID]["has"] = +task[resourceID]["has"] - quantity;
		task[resourceID]["needs"] = +task[resourceID]["needs"] + quantity;
		this.pendingResources[resourceID] = this.pendingResources[resourceID] ? this.pendingResources[resourceID] : 0;
		this.pendingResources[resourceID] += quantity;
	}

	releaseResources(taskID) {
		const task = this.tasks[taskID];
		const resourceIDs = this.getResourceIDs(taskID);

		for (let i = 0; i < resourceIDs.length; i++) {
			const resourceID = resourceIDs[i];
			this.exchangeUnits({"recipient": "manager", task, resourceID, "quantity": task[resourceID]["has"]});
		}
	}

	updateResources() {
		this.addPendingResources();
		this.resetPendingResources();
	}

	addPendingResources() {
		for (let i = 0; i < Object.keys(this.pendingResources).length; i++) {
			const resourceID = Object.keys(this.pendingResources)[i];
			this.resources[resourceID] += this.pendingResources[resourceID];
		}
	}

	resetPendingResources() {
		for (let i = 0; i < Object.keys(this.pendingResources).length; i++) {
			const resourceID = Object.keys(this.pendingResources)[i];
			this.pendingResources[resourceID] = 0;
		}
	}

	reportResourcesAvailability() {
		let output = "AVAILABLE: ";
		for (let i = 0; i < Object.keys(this.resources).length; i++) {
			const resourceID = Object.keys(this.resources)[i];
			output += this.reportResourceAvailability(resourceID);
		}
		this.logger.log(output);
		this.logger.logLine();
	}

	reportResourceAvailability(resourceID) {
		return `R${resourceID} (${this.resources[resourceID]})`;
	}

	updateStatus(taskID) {
		const task = this.tasks[taskID];

		if (task["status"] !== "terminated" && task["status"] !== "aborted") {
			task["status"] = task["delay"] === 0 ? "ready" : "blocked";
		}
	}

	updateQueue() {
		this.moveBlockedQueueToQueue();
		this.moveNonBlockedQueueToQueue();
	}

	moveBlockedQueueToQueue() {
		while (!this.blockedQueue.isEmpty()) {
			this.queue.add(this.blockedQueue.remove());
		}
	}

	moveNonBlockedQueueToQueue() {
		while (!this.nonblockedQueue.isEmpty()) {
			this.queue.add(this.nonblockedQueue.remove());
		}
	}

	updateBlockedAndNonBlockedQueues(taskID) {
		if (this.activitiesRemaining(this.tasks[taskID]["activities"])) {
			this.addToAppropriateQueue(taskID, this.tasks[taskID]["status"]);
		}
	}

	addToAppropriateQueue(taskID, status) {
		switch (status) {
			case "ready": this.nonblockedQueue.add(taskID); break;
			case "delayed": this.nonblockedQueue.add(taskID); break;
			case "blocked": this.blockedQueue.add(taskID); break;
			default: break;
		}
	}

	activitiesRemaining(activities) {
		return activities.length > 0;
	}

	areResourcesPending() {
		let pending = false;
		for (let i = 0; i < Object.keys(this.pendingResources); i++) {
			pending = pending || this.isResourcePending(Object.keys(this.pendingResources)[i]);
		}

		return(pending);
	}

	isResourcePending(resource) {
		return +resource > 0;
	}

	processDelay(taskID, activity, delay) {
		this.tasks[taskID]["delay"] = +delay;
		activity["delay"] -= 1;
		this.tasks[taskID]["status"] = "delayed";
		this.handleDelay(taskID, activity);
	}

	isDelayed(delay) {
		return delay > 0;
	}

	approveRequest(taskID, resourceID, unitsRequested) {
		const task = this.tasks[taskID];
		this.exchangeUnits({"recipient": "task", task, resourceID, "quantity": unitsRequested});
		this.reportRequestApproval(taskID, unitsRequested, resourceID);
	}

	reportRequestApproval(taskID, unitsRequested, resourceID) {
		this.logger.log(`${this.curCycle}: Task #${taskID} granted ${unitsRequested} R${resourceID}`);
	}

	rejectRequest(taskID, resourceID, unitsRequested, unsafeRequest) {
		this.tasks[taskID]["status"] = "blocked";
		this.tasks[taskID]["wait"] += 1;
		this.reportRequestRejection(taskID, unitsRequested, resourceID, unsafeRequest);
	}

	reportRequestRejection(taskID, unitsRequested, resourceID, unsafeRequest) {
		let output = `${this.curCycle}: Task #${taskID} NOT granted ${unitsRequested} R${resourceID}`;
		output += unsafeRequest ? " (unsafe request)" : "";
		this.logger.log(output);
	}

	isFulfillableRequest(unitsRequested, resourceID) {
		return unitsRequested <= this.resources[resourceID];
	}

	handleAbortion(taskID, context) {
		this.abort(taskID);
		this.reportAbortion(taskID, context);
	}

	reportAbortion(taskID, context) {
		const messages = {
			"initiation": `${this.curCycle}: Task #${taskID} aborted (impossible to fulfill)`,
			"request": `${this.curCycle}: Task #${taskID} aborted (requested more than needed)`,
			"deadlock": `${this.curCycle}: DEADLOCK! Task #${taskID} aborted`
		};
		this.logger.log(messages[context]);
	}

	getResourceIDs(taskID) {
		const keysToIgnore = ["activities", "delay", "time", "wait", "status"];
		return Object.keys(this.tasks[taskID]).filter(function(key) {
			return !keysToIgnore.includes(key);
		});
	}

	requestsPending(activities) {
		return activities.filter(function(numRequests, activity) {
			return activity["action"] === "request" ? numRequests + 1 : numRequests;
		}, 0);
	}

	isFulfillableRequest(unitsRequested, resourceID) {
		return unitsRequested <= this.resources[resourceID];
	}

};