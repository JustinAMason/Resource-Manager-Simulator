module.exports =

class ResourceManager {

	constructor(config) {
		this.resources = config["resources"];
		this.logger = config["detailsLogger"];
		this.queue = config["queue"];
		this.tasks = config["tasks"];
	}

};