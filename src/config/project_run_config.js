const path = require("path");

module.exports = {
	getConfig
};

function getConfig(args) {
	const file = getFile(args[2]);
	const detailedOutput = getDetailedOutput(args[3]);
	logConfiguration(file, detailedOutput);
	return {
		"file": file,
		"detailed_output": detailedOutput
	};
}

function getFile(arg) {
	return(arg ? arg : path.resolve(__dirname, "../../sample_inputs/input-01.txt"));
}

function getDetailedOutput(arg) {
	return(arg ? true : false);
}

function logConfiguration(file, detailedOutput) {

	const outputVersion = (detailedOutput) ? "Detailed Output" : "Results Only";

	console.log(`FILE USED: ${file}`);
	console.log(`OUTPUT VERSION: ${outputVersion}`);
	console.log();

}