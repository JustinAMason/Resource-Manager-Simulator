const file_reader = require(__dirname + "/file_reader.js");

module.exports = {
	getResources
};

function getResources(args) {
	const data = file_reader.readFile(args["file"]);
	const resourceData = getResourceData(data.split("\n"));
	return getResourceConfig(resourceData);
}

//private method
function getResourceData(fileData) {
	const configVals = fileData[0].split(" ");
	configVals.shift();
	return(configVals);
}

//private method
function getResourceConfig(resourceData) {
	const [numResources, resourceQuantity] = resourceData;
	const resources = {};

	for (let i = 1; i <= numResources; i++) {
		addResource(resources, i, resourceQuantity);
	}
	
	return resources;
}

//private method
function addResource(resources, resourceID, quantity) {
	resources[resourceID] = +quantity;
}