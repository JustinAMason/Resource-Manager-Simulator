const chai = require("chai");
const tasks_reader = require("../../src/file_handling/tasks_reader.js");
const factories = require("../factories");

const expect = chai.expect;

describe("tasks_reader", function() {

	describe("#getTasks()", function() {

		context("Valid file path given", function() {

			const commandLineConfig = { file: "test/test_input_files/input-01.txt" };
			const expected = factories.input_01_tasks_without_activities;
			const actual = tasks_reader.getTasks(commandLineConfig);

			it("should create a tasks object without activities from the file path given", function() {
				expect(expected).to.deep.equal(actual);
			});

		});

		context("Invalid/No file path given", function() {

			const commandLineConfig = {};
			const expected = factories.input_01_tasks_without_activities;
			const actual = tasks_reader.getTasks(commandLineConfig);

			it("should create a tasks object without activities from the file path given", function() {
				expect(expected).to.deep.equal(actual);
			});

		});

	});

});