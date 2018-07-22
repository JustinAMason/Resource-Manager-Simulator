const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class OptimisticManager extends ResourceManager {

	constructor(config) {
		super(config); // logger, queue, tasks, resources
	}

	run() {

		let curCycle = 1;

		this.logger.logHeader("Optimistic Resource Manager Simulation");

		while (!this.queue.isEmpty()) {

			this.showResourcesAvailable();

			for (let i = 0; i < this.queue.size(); i++) {
				this.runCycle();
			}

			console.log();

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
			case "request": this.request(); break;
			case "release": this.release(); break;
			case "terminate": this.terminate(); break;
			default: break;
		}

		activities.shift();

		this.updateTasks(taskID);

	}

	updateTasks(taskID) {

		const task = this.tasks[taskID];
		const activities = task["activities"];

		if (activities.length == 0) {
			delete this.tasks[taskID];
		} else {
			this.queue.add(taskID);
		}

	}

	request() {
		console.log("REQUEST");
	}

	release() {
		console.log("RELEASE");
	}

	terminate() {
		console.log("TERMINATE");
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

};