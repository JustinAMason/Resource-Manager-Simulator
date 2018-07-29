const file_reader = require(__dirname + "/file_reader.js");

module.exports = {
	getResources
};

// BEGIN public interface

function getResources(args) {
	const data = file_reader.readFile(args["file"]);
	const resourceData = getResourceData(data.split("\n"));
	return getResourceConfig(resourceData);
}

// END public interface

function getResourceData(fileData) {
	const configVals = fileData[0].split(" ");
	configVals.shift();
	return(configVals);
}

function getResourceConfig(resourceData) {
	const [numResources, resourceQuantity] = resourceData;
	const resources = {};

	for (let i = 1; i <= numResources; i++) {
		addResource(resources, i, resourceQuantity);
	}
	
	return resources;
}

function addResource(resources, resourceID, quantity) {
	resources[resourceID] = +quantity;
}