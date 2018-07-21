const file_reader = require(__dirname + "/file_reader.js");

module.exports = {
	getResources
};

function getResources(args) {
	const file = args["file"];
	const data = file_reader.readFile(file);
	const resourceData = getResourceData(data.split("\n"));
	const config = getResourceConfig(resourceData);
	return(config);
}

function getResourceData(data) {
	const configRow = data[0];
	const configVals = configRow.split(" ");
	configVals.shift();
	return(configVals);
}

function getResourceConfig(data) {

	let numResources = +data[0];
	let resourceQuantity = +data[1];

	const config = {};

	for (let i = 1; i <= numResources; i++) {
		config[i] = resourceQuantity;
	}

	return(config);

}