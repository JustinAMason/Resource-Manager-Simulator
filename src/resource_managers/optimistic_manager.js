const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class OptimisticManager extends ResourceManager {

	constructor(config) {
		super(config);
		this.header = "Optimistic Resource Manager Simulation";
	}

	// private method
	initiate(taskID) {
		this.logger.log(`${this.curCycle}: Task #${taskID} initiated`);
	}

	// private method
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
				this.exchangeUnits({"recipient": "task", task, resourceID, "quantity": unitsRequested});
				this.logger.log(`${this.curCycle}: Task #${taskID} granted ${unitsRequested} R${resourceID}`);
			} else {
				task["status"] = "blocked";
				task["wait"] += 1;
				this.logger.log(`${this.curCycle}: Task #${taskID} NOT granted ${unitsRequested} R${resourceID}`);
			}
		}

	}

	// private method
	deadlocked() {
		return(this.blockedQueue.size() > 0 && this.nonblockedQueue.size() === 0);
	}

};