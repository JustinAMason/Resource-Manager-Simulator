const chai = require("chai");
const BankerManager = require("../../src/resource_managers/dijkstra_banker_manager");
const Logger = require("../../src/logger/logger");
const Queue = require("../../src/task_handling/queue");
const factories = require("../factories");
const expect = chai.expect;

describe("dijkstra_banker_manager", function() {
	describe("#run()", function() {

		const tasksList = JSON.parse(JSON.stringify(factories.tasks_with_activities));
		const resourcesList = JSON.parse(JSON.stringify(factories.resources));
		const expectations = JSON.parse(JSON.stringify(factories.tasks_after_banker_management));
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
				const manager = new BankerManager(config);
				manager.run();
				const expected = expectations[i];
				const actual = tasks;
				expect(expected).to.deep.equal(actual);
			});
		}
	});
});