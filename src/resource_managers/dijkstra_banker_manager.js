const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class DijkstraBankerManager extends ResourceManager {

	constructor(config) {
		super(config);
		this.header = "Dijkstra's Banker Resource Manager Simulation";
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
				if (this.isSafeRequest(action)) {
					this.exchangeUnits({"recipient": "task", task, resourceID, "quantity": unitsRequested});
					this.logger.log(`${this.curCycle}: Task #${taskID} granted ${unitsRequested} R${resourceID}`);
				} else {
					task["status"] = "blocked";
					task["wait"] += 1;
					this.logger.log(`${this.curCycle}: Task #${taskID} NOT granted ${unitsRequested} R${resourceID} (unsafe request)`);
				}
			} else {
				task["status"] = "blocked";
				task["wait"] += 1;
				this.logger.log(`${this.curCycle}: Task #${taskID} NOT granted ${unitsRequested} R${resourceID}`);
			}
		}

	}

	isSafeRequest() {
		return true;
	}

	deadlocked() {
		return(this.areResourcesPending());
	}

};