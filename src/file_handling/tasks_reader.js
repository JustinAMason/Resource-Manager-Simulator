const file_reader = require(__dirname + "/file_reader.js");

module.exports = {
	getTasks,
	showTasksState
};

function getTasks(args) {
	const file = args["file"];
	const data = file_reader.readFile(file);
	const initiations = getInitiations(data.split("\n"));
	const activities = getAllActivities(data.split("\n"));
	const numTasks = getNumTasks(data.split("\n"));
	const tasks = createTasks({numTasks, initiations, activities});
	return(tasks);
}

function showTasksState(tasks) {

	Object.keys(tasks).forEach(function(taskID) {

		const task = tasks[taskID];
		let output = `Task #${taskID} needs `;

		Object.keys(task).forEach(function(resourceID) {

			if (resourceID !== "activities") {

				const resource = task[resourceID];
				output += (output === `Task #${taskID} needs `) ? "" : ", ";

				output += `${resource["needs"]} of R${resourceID} (has ${resource["has"]})`;

			}
			
		});

		output += ".";

		console.log(output);

	});

}

// private method
function getInitiations(data) {

	data.shift();

	data = data.filter(function(activity) {
		const activityType = activity.split(" ")[0];
		return activityType === "initiate" ? true : false;
	});

	data = data.map(function(activity) {
		activity = activity.split("  ");
		return(activity[1]);
	});

	return(data);

}

// private method
function getAllActivities(data) {

	data.shift();

	data = data.filter(function(activity) {
		const activityType = activity.split(" ")[0];
		return activityType !== "initiate" ? true : false;
	});

	return(data);

}

// private method
function getNumTasks(data) {
	return(+data[0][0]);
}

// private method
function createTasks(config) {

	const numTasks = config["numTasks"];
	const initiations = config["initiations"];
	const allActiviies = config["activities"];

	const tasks = {};
	for (let i = 1; i <= numTasks; i++) {
		tasks[i] = {};
	}

	initiations.forEach(function(initiation) {
		initiation = initiation.split(" ");
		const taskID = initiation[0];
		const resourceType = initiation[2];
		const resourceClaim = initiation[3];

		tasks[taskID][resourceType] = {
			"needs": +resourceClaim,
			"has": 0
		};

		tasks[taskID]["activities"] = [];
		tasks[taskID]["delay"] = 0;
		tasks[taskID]["time"] = 0;
		tasks[taskID]["wait"] = 0;
		tasks[taskID]["status"] = "ready";

	});

	return(tasks);

}