const chai = require("chai");
const tasks_reader = require("../../src/file_handling/tasks_reader.js");
const factories = require("../factories");
const expect = chai.expect;

describe("tasks_reader", function() {
	describe("#getTasks()", function() {
		context("Valid file path given", function() {
			const commandLineConfigs = JSON.parse(JSON.stringify(factories.command_line_configs));
			const expectations = JSON.parse(JSON.stringify(factories.tasks_without_activities));
			it("creates a tasks object (without activities) from the file path given", function() {
				commandLineConfigs.forEach(function(commandLineConfig, i) {
					const expected = expectations[i];
					const actual = tasks_reader.getTasks(commandLineConfig);
					expect(expected).to.deep.equal(actual);
				});
			});

		});
		context("Invalid/No file path given", function() {
			const commandLineConfig = {};
			const expected = JSON.parse(JSON.stringify(factories.tasks_without_activities[0]));
			const actual = tasks_reader.getTasks(commandLineConfig, "test");
			it("creates a tasks object (without activities) from the default file path (test/test_input_files/input_01)", function() {
				expect(expected).to.deep.equal(actual);
			});
		});
	});
});