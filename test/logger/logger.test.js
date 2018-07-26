const chai = require("chai");
const Logger = require("../../src/logger/logger");
const factories = require("../factories");
const expect = chai.expect;

describe("logger", function() {
	describe("#Instantiation", function() {
		context("no arguments given", function() {
			it("sets 'showOutput' to false and 'lineLength' to 75", function() {
				const logger = new Logger();
				const expected_showOutput = false;
				const expected_lineLength = 75;
				const actual_showOutput = logger.showOutput;
				const actual_lineLength = logger.lineLength;
				expect(expected_showOutput).to.deep.equal(actual_showOutput);
				expect(expected_lineLength).to.deep.equal(actual_lineLength);
			});
		});
		context("'show_output' argument given", function() {
			it("sets 'showOutput' to provided value", function() {
				const logger = new Logger({"show_output": true});
				const expected_showOutput = true;
				const actual_showOutput = logger.showOutput;
				expect(expected_showOutput).to.deep.equal(actual_showOutput);
			});
		});
		context("'line_length' argument given", function() {
			it("sets 'lineLength' to provided value", function() {
				const logger = new Logger({"line_length": 5});
				const expected_lineLength = 5;
				const actual_lineLength = logger.lineLength;
				expect(expected_lineLength).to.deep.equal(actual_lineLength);
			});
		});
	});
});