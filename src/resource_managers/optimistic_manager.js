// TODO: Change logic of initiation (it appears that initiations are not combined into one cycle)

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
			this.logger.log(`${this.curCycle}: Task #${taskID} granted ${unitsRequested} R${resourceID}`);
		} else {
			task["status"] = "blocked";
			task["wait"] += 1;
			this.logger.log(`${this.curCycle}: Task #${taskID} NOT granted ${unitsRequested} R${resourceID}`);
		}

	}

};