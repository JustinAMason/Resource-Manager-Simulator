const tasks_reader = require(__dirname + "/../file_handling/tasks_reader.js");

module.exports =

class Logger {

	constructor(args) {
		this.detailedOutput = args["detailed_output"] ? args["detailed_output"] : false;
		this.lineLength = args["line_length"] ? args["line_length"] : 70;
	}

	log(output) {
		if (this.detailedOutput) {
			console.log(output);
		}
	}

	logHeader(header) {
		if (this.detailedOutput) {
			const line = "=".repeat((this.lineLength - header.length) / 2);
			let output = line + header.toUpperCase() + line;
			if (output.length < 70) {
				output += "=";
			}
			console.log(output);
			console.log();
		}
	}

	logHeaderBreak() {
		if (this.detailedOutput) {
			console.log("=".repeat(this.lineLength));
		}
	}

	logLine() {
		if (this.detailedOutput) {
			console.log("-".repeat(this.lineLength / 2));
		}
	}

	showTasksState(tasks) {
		if (this.detailedOutput) {
			tasks_reader.showTasksState({tasks});
		}
	}

};