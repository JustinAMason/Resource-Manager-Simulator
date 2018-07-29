const file_reader = require(__dirname + "/file_reader.js");

module.exports = {
	addActivitiesToTasks
};

// BEGIN public interface

function addActivitiesToTasks(args) {
	const tasks = args["tasks"];
	const data = file_reader.readFile(args["commandLineConfig"]["file"]);
	const activities = getActivities(getActivitiesData(data.split("\n")));
	return addActivities(tasks, activities);
}

// END public interface

function getActivities(activitiesLog) {
	const activities = [];
	let activityID = 1;

	activitiesLog.forEach(function(activityString) {
		activities.push(getActivity(activityID, getActivityParts(activityString)));
		activityID += 1;
	});

	return(activities);
}

function getActivity(activityID, activityParts) {
	const [action, taskID, delay, resourceID, quantity] = activityParts;
	return {
		"activityID": activityID,
		"action": action,
		"taskID": taskID,
		"delay": delay,
		"resourceID": resourceID,
		"quantity": quantity
	};
}

function getActivityParts(activityString) {
	return activityString.split(" ").filter(function(activityPart) {
		return(activityPart !== "");
	});
}

function getActivitiesData(data) {
	return data.filter(function(activity, index) {
		return isValidActivity(getActivityType(activity), index);
	});
}

function isValidActivity(activityType, activityIndex) {
	return activityType !== "" && activityIndex > 0;
}

function getActivityType(activity) {
	return activity.split(" ")[0];
}

function addActivities(tasks, activities) {
	activities.forEach(function(activity) {
		addActivity(tasks, activity);
	});

	return(tasks);
}

function addActivity(tasks, activity) {
	tasks[activity["taskID"]]["activities"].push(activity);
}