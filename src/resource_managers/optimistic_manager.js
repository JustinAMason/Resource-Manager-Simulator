const ResourceManager = require(__dirname + "/resource_manager.js");

module.exports =

class OptimisticManager extends ResourceManager {

	// BEGIN public interface

	constructor(config) {
		super(config);
		this.header = "Optimistic Resource Manager Simulation";
	}

	// END public interface

	initiate(taskID) {
		this.reportInitiation(taskID);
	}

	processRequest(taskID, resourceID, unitsRequested, unsafe) {
		if (this.isFulfillableRequest(unitsRequested, resourceID)) {
			this.approveRequest(taskID, resourceID, unitsRequested);
		} else {
			this.rejectRequest(taskID, resourceID, unitsRequested, unsafe);
		}
	}

	deadlocked() {
		return(this.blockedQueue.size() > 0 && this.nonblockedQueue.size() === 0);
	}
	
};