const tasks_reader = require(__dirname + "/../file_handling/tasks_reader.js");

module.exports =

class Logger {

	constructor(args) {
		this.detailedOutput = args["detailed_output"] ? args["detailed_output"] : false;
	}

	log(output) {
		if (this.detailedOutput) {
			console.log(output);
		}
	}

	showTasksState(tasks) {
		if (this.detailedOutput) {
			tasks_reader.showTasksState({tasks});
		}
	}

};