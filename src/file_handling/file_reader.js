const fs = require("fs");

module.exports = {
	readFile
};

// BEGIN public interface

function readFile(file, test) {
	try {
		return fs.readFileSync(file, "utf8");
	} catch (err) {
		reportFileReadError(test);
		return readBackupFile();
	}
}

// END public interface

function reportFileReadError(test) {
	if (!test) {
		console.log("ERROR: File cannot be read. Using input-01.txt (default)\n");
	}
}

function readBackupFile() {
	const backupFile = "test/test_input_files/input-01.txt";
	try {
		return fs.readFileSync(backupFile, "utf8");
	} catch (err) {
		console.log(`ERROR: Default file cannot be read. Did you remove ${backupFile}?`);
	}
}