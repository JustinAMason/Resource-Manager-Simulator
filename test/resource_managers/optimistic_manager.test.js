const chai = require("chai");
const OptimisticManager = require("../../src/resource_managers/optimistic_manager");
const Logger = require("../../src/logger/logger");
const Queue = require("../../src/task_handling/queue");
const factories = require("../factories");
const expect = chai.expect;

describe("optimistic_manager", function() {
	describe("#run()", function() {

		const tasksList = JSON.parse(JSON.stringify(factories.tasks_with_activities));
		const resourcesList = JSON.parse(JSON.stringify(factories.resources));
		const expectations = JSON.parse(JSON.stringify(factories.tasks_after_optimistic_management));
		const detailsLogger = new Logger({"showOutput": false});

		for (let i = 0; i < tasksList.length; i++) {
			it(`successfully and correctly modifies tasks object generated from test/test_input_files/input_${i > 8 ? i + 1 : "0" + (i + 1)}`, function() {
				const resources = resourcesList[i];
				const tasks = tasksList[i];
				const queue = new Queue(tasks);
				const config = {
					resources,
					detailsLogger,
					queue,
					tasks
				};
				const manager = new OptimisticManager(config);
				manager.run();
				const expected = expectations[i];
				const actual = tasks;
				expect(expected).to.deep.equal(actual);
			});
		}
	});
});