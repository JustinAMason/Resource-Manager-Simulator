module.exports = {
	copyObject,
	copyInstance
};

function copyObject(object, quantity) {
	quantity = getCopyQuantity(quantity);

	const copies = [];
	for (let i = 0; i < quantity; i++) {
		copies.push(JSON.parse(JSON.stringify(object)));
	}

	return(copies);
}

function copyInstance(instance, instanceArgs, quantity) {
	quantity = getCopyQuantity(quantity);

	const copies = [];
	for (let i = 0; i < quantity; i++) {
		copies.push(new instance(instanceArgs));
	}

	return(copies);
}

function getCopyQuantity(quantity) {
	return quantity ? quantity : 1;
}