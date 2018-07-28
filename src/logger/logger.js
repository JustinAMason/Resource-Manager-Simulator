const tasks_reader = require(__dirname + "/../file_handling/tasks_reader.js");

module.exports =

class Logger {

	constructor(args) {
		args = args ? args : {};
		this.showOutput = args["show_output"] ? args["show_output"] : false;
		this.lineLength = args["line_length"] ? args["line_length"] : 75;
		this.headerCharacter = "=";
		this.lineCharacter = "-";
	}

	log(output) {
		if (this.showOutput) {
			output = output ? output : "";
			console.log(output);
		}
	}

	logHeader(header) {
		if (this.showOutput) {
			const line = this.headerCharacter.repeat((this.lineLength - header.length) / 2);
			let output = line + header.toUpperCase() + line;

			if (this.lineTooShort(line)) {
				output += this.headerCharacter;
			}

			console.log(`${output}\n`);
		}
	}

	logLine() {
		if (this.showOutput) {
			console.log(this.lineCharacter.repeat(this.lineLength / 2));
		}
	}

	//private method
	lineTooShort(line) {
		return line.length < this.lineLength;
	}

};