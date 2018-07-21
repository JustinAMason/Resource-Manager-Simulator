module.exports =

class Logger {

	constructor(args) {
		this.detailedOutput = args["detailed_output"];
	}

	log(output) {
		if (this.detailedOutput) {
			console.log(output);
		}
	}

};