const chai = require("chai");
const activities_reader = require("../../src/file_handling/activities_reader.js");
const factories = require("../factories");
const expect = chai.expect;

describe("activities_reader", function() {
	describe("#addActivitiesToTasks()", function() {
		it("correctly adds activities to their tasks", function() {
			const commandLineConfigs = JSON.parse(JSON.stringify(factories.command_line_configs));
			const tasksWithoutActivities = JSON.parse(JSON.stringify(factories.tasks_without_activities));
			const tasksWithActivities = JSON.parse(JSON.stringify(factories.tasks_with_activities));
			commandLineConfigs.forEach(function(commandLineConfig, i) {
				const taskWithoutActivities = tasksWithoutActivities[i];
				const expected = tasksWithActivities[i];
				const actual  = activities_reader.addActivitiesToTasks({"commandLineConfig": commandLineConfig, "tasks": taskWithoutActivities});
				expect(expected).to.deep.equal(actual);
			});
		});
	});
});