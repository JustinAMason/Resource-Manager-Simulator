const fs = require("fs");

module.exports = {
	readFile
};

function readFile(file, test) {

	try {
		return fs.readFileSync(file, "utf8");
	} catch (err) {
		if (!test) {
			console.log("ERROR: File cannot be read. Using input-01.txt (default)\n");
		}
		try {
			return fs.readFileSync("/Users/justinmason/Documents/Personal-Projects/Resource-Manager-Simulator/sample_inputs/input-01.txt", "utf8");
		} catch (err) {
			console.log("ERROR: File cannot be read.");
		}
	}
	
}