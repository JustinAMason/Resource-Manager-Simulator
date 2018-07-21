const file_reader = require(__dirname + "/file_reader.js");

module.exports = {
	addActivitiesToTasks
};

function addActivitiesToTasks(args) {
	const file = args["commandLineConfig"]["file"];
	let tasks = args["tasks"];
	const data = file_reader.readFile(file);
	const activitiesData = getActivitiesData(data.split("\n"));
	const activities = getActivities(activitiesData);
	tasks = addActivities({tasks, activities});
	return(tasks);
}

function getActivitiesData(data) {

	data.shift();

	data = data.filter(function(activity) {
		const activityType = activity.split(" ")[0];
		return activityType !== "initiate" && activityType !== "";
	});

	return(data);
}

function getActivities(activitiesLog) {

	const activities = [];

	let activityID = 1;

	activitiesLog.forEach(function(activityData) {
		activityData = activityData.split(" ");
		activityData = activityData.filter(function(x) {
			return(x !== "");
		});

		const action = activityData[0];
		const taskID = activityData[1];
		const delay = activityData[2];

		if (action !== "terminate") {
			const resourceID = activityData[3];
			const quantity = activityData[4];
			activities.push({
				"activityID": activityID,
				"action": action,
				"taskID": taskID,
				"delay": delay,
				"resourceID": resourceID,
				"quantity": quantity
			});
		} else {
			activities.push({
				"activityID": activityID,
				"action": action,
				"taskID": taskID,
				"delay": delay,
			});
		}

		activityID += 1;

	});

	return(activities);
}

function addActivities(args) {
	const tasks = args["tasks"];
	const activities = args["activities"];

	activities.forEach(function(activity) {
		const taskID = activity["taskID"];
		tasks[taskID]["activities"].push(activity);
	});

	return(tasks);

}