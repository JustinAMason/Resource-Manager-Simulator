const tasks_reader = require(__dirname + "/../file_handling/tasks_reader.js");

module.exports =

class Logger {

	constructor(args) {
		args = args ? args : {};
		this.showOutput = args["show_output"] ? args["show_output"] : false;
		this.lineLength = args["line_length"] ? args["line_length"] : 75;
	}

	log(output) {
		if (this.showOutput) {
			output = output ? output : "";
			console.log(output);
		}
	}

	logHeader(header) {
		if (this.showOutput) {
			const line = "=".repeat((this.lineLength - header.length) / 2);
			let output = line + header.toUpperCase() + line;
			if (output.length < this.lineLength) {
				output += "=";
			}
			console.log(output);
			console.log();
		}
	}

	logHeaderBreak() {
		if (this.showOutput) {
			console.log("=".repeat(this.lineLength));
		}
	}

	logLine() {
		if (this.showOutput) {
			console.log("-".repeat(this.lineLength / 2));
		}
	}

	showTasksState(tasks) {
		if (this.showOutput) {
			tasks_reader.showTasksState({tasks});
		}
	}

};