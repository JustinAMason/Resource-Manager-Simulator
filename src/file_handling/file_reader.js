const fs = require("fs");

module.exports = {
	getResourcesAvailable
};

function getResourcesAvailable(args) {
	const file = args["file"];
	const data = readFile(file);
	const configInfo = getResourceInfo(data.split("\n"));
	const config = getResourceConfig(configInfo);
	return(config);
}

function readFile(file) {

	try {
		return fs.readFileSync(file, "utf8");
	} catch (err) {
		console.log("ERROR: File cannot be read. Using input-01.txt (default)\n");
		return fs.readFileSync("/Users/justinmason/Documents/Personal-Projects/Resource-Manager-Simulator/sample_inputs/input-01.txt", "utf8");
	}
	
}

function getResourceInfo(data) {
	const configRow = data[0];
	const configVals = configRow.split(" ");
	configVals.shift();
	return(configVals);
}

function getResourceConfig(resourceInfo) {

	let numResources = +resourceInfo[0];
	let resourceQuantity = +resourceInfo[1];

	const config = {};

	for (let i = 1; i <= numResources; i++) {
		config[i] = resourceQuantity;
	}

	return(config);

}