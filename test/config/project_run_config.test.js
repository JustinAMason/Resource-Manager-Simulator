const chai = require("chai");
const project_run_config = require("../../src/config/project_run_config");
const factories = require("../factories");
const expect = chai.expect;

describe("project_run_config", function() {
	describe("#getConfig()", function() {
		context("second command line argument given", function() {
			it("converts command line arguments into a command line configuration object; output version set to detailed", function() {
				const args = [ "command", "run_file", "input_file", "argument"];
				const expected = {"file": "input_file", "show_output": true};
				const actual = project_run_config.getConfig(args, "test");
				expect(expected).to.deep.equal(actual);
			});
		});
		context("second command line argument not given", function() {
			it("converts command line arguments into a command line configuration object; output version set to results only", function() {
				const args = [ "command", "run_file", "input_file", "argument"];
				const expected = {"file": "input_file", "show_output": true};
				const actual = project_run_config.getConfig(args, "test");
				expect(expected).to.deep.equal(actual);
			});
		});
	});
});