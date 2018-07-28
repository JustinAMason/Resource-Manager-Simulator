const path = require("path");

module.exports = {
	getConfig
};

function getConfig(args, test) {
	const file = getFile(args[2]);
	const showOutput = getShowOutput(args[3]);

	if (!test) {
		reportConfiguration(file, showOutput);
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
function reportConfiguration(file, showOutput) {
	const outputVersion = getOutputVersion(showOutput);
	console.log(`\nFILE USED: ${file}\nOUTPUT VERSION: ${outputVersion}\n`);
}

// private method
function getOutputVersion(output) {
	return output ? "Detailed Output" : "Results Only";
}