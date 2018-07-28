const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class OptimisticManager extends ResourceManager {

	constructor(config) {
		super(config);
		this.header = "Optimistic Resource Manager Simulation";
	}

	//private method
	initiate(taskID) {
		this.reportInitiation(taskID);
	}

	//private method
	processRequest(taskID, resourceID, unitsRequested, unsafe) {
		if (this.isFulfillableRequest(unitsRequested, resourceID)) {
			this.approveRequest(taskID, resourceID, unitsRequested);
		} else {
			this.rejectRequest(taskID, resourceID, unitsRequested, unsafe);
		}
	}

	//private method
	deadlocked() {
		return(this.blockedQueue.size() > 0 && this.nonblockedQueue.size() === 0);
	}

};