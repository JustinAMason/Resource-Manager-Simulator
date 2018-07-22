const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class OptimisticManager extends ResourceManager {

	constructor(config) {
		super(config); // logger, queue, tasks, resources, blockedQueue, nonblockedQueue, curCycle
		this.header = "Optimistic Resource Manager Simulation";
	}

	handleRequest(action) {

		const taskID = action["taskID"];
		const task = this.tasks[taskID];
		const resourceID = action["resourceID"];
		const unitsRequested = action["quantity"];

		if (unitsRequested <= this.resources[resourceID]) {
			this.exchangeUnits({"recipient": "task", task, resourceID, "quantity": unitsRequested});
			this.logger.log(`Task #${taskID} granted ${unitsRequested} R${resourceID}`);
		} else {
			task["status"] = "blocked";
			this.logger.log(`Task #${taskID} NOT granted ${unitsRequested} R${resourceID}`);
		}
		
	}

	release(taskID) {
		console.log("RELEASE");
	}

	terminate() {
		console.log("TERMINATE");
	}

};