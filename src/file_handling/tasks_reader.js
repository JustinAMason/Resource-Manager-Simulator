const file_reader = require(__dirname + "/file_reader.js");

module.exports = {
	getTasks,
};

// BEGIN public interface

function getTasks(args, test) {
	const fileData = file_reader.readFile(args["file"], test);
	const initiations = getInitiations(fileData.split("\n"));
	const numTasks = getNumTasks(fileData.split("\n"));
	return createTasks(numTasks, initiations);
}

// END public interface

function getInitiations(fileData) {
	fileData.shift();
	return getInitiationsInformation(getInitiationActivities(fileData));
}

function getInitiationActivities(activities) {
	return activities.filter(function(activity) {
		return isInitiation(activity);
	});
}

function isInitiation(activity) {
	const activityType = activity.split(" ")[0];
	return activityType === "initiate";
}

function getInitiationsInformation(initiationActivities) {
	return initiationActivities.map(function(activity) {
		return activity.split("  ")[1];
	});
}

function getNumTasks(data) {
	return(+data[0][0]);
}

function createTasks(numTasks, initiations) {
	const tasks = initializeTasks(numTasks);

	initiations.forEach(function(initiation) {
		const [taskID, , resourceType, resourceClaim] = initiation.split(" ");
		addResource(tasks, taskID, resourceType, resourceClaim);
		fillTask(tasks, taskID);
	});

	return(tasks);
}

function initializeTasks(numTasks) {
	const tasks = {};
	for (let taskID = 1; taskID <= numTasks; taskID++) {
		initializeTask(tasks, taskID);
	}
	return(tasks);
}

function initializeTask(tasks, taskID) {
	tasks[taskID] = {};
}

function addResource(tasks, taskID, resourceID, resourceClaim) {
	tasks[taskID][resourceID] = {
		"needs": +resourceClaim,
		"has": 0
	};
}

function fillTask(tasks, taskID) {
	tasks[taskID]["activities"] = [];
	tasks[taskID]["delay"] = 0;
	tasks[taskID]["time"] = 0;
	tasks[taskID]["wait"] = 0;
	tasks[taskID]["status"] = "ready";
}