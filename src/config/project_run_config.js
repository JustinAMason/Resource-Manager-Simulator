const path = require("path");

module.exports = {
	getConfig
};

function getConfig(args, test) {

	const file = getFile(args[2]);
	const showOutput = getShowOutput(args[3]);
	const showConfiguration = test ? false : true;

	if (!test) {
		logConfiguration(file, showOutput);
	}
	
	return {"file": file, "show_output": showOutput};
	
}

// private method
function getFile(arg) {
	return(arg ? arg : path.resolve(__dirname, "../../sample_inputs/input-01.txt"));
}

// private method
function getShowOutput(arg) {
	return(arg ? true : false);
}

// private method
function logConfiguration(file, showOutput) {

	const outputVersion = (showOutput) ? "Detailed Output" : "Results Only";

	console.log();
	console.log(`FILE USED: ${file}`);
	console.log(`OUTPUT VERSION: ${outputVersion}`);
	console.log();

}