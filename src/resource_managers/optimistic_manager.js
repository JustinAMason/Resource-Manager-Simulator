const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class OptimisticManager extends ResourceManager {

	constructor(config) {
		super(config); // logger, queue, tasks, resources
	}

	run() {

		let curCycle = 1;
		this.logger.logHeader("Optimistic Reesource Manager Simulation");

		while (!this.queue.isEmpty()) {
			this.showResourcesAvailable();
			this.runCycle();
			break;
		}

	}

	runCycle() {
		console.log("Running cycle...");
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
		return;
	}

};