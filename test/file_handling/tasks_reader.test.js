const chai = require("chai");
const tasks_reader = require("../../src/file_handling/tasks_reader.js");
const factories = require("../factories");
const expect = chai.expect;

describe("tasks_reader", function() {
	describe("#getTasks()", function() {
		context("Valid file paths given", function() {
			const commandLineConfigs = factories.command_line_configs;
			const expectations = factories.tasks_without_activities;
			it("should create tasks objects without activities from the file paths given", function() {
				commandLineConfigs.forEach(function(commandLineConfig, i) {
					const expected = expectations[i];
					const actual = tasks_reader.getTasks(commandLineConfig);
					expect(expected).to.deep.equal(actual);
				});
			});

		});
		context("Invalid/No file path given", function() {
			const commandLineConfig = {};
			const expected = factories.tasks_without_activities[0];
			const actual = tasks_reader.getTasks(commandLineConfig);
			it("should create a tasks object without activities from the default file path (input_01)", function() {
				expect(expected).to.deep.equal(actual);
			});
		});
	});
});