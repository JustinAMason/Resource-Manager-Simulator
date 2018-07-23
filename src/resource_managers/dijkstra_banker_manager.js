const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class DijkstraBankerManager extends ResourceManager {

	constructor(config) {
		super(config);
		this.header = "Banker Resource Manager Simulation";
	}

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

};