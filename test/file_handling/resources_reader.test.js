const fs = require("fs");
const chai = require("chai");
const resources_reader = require("../../src/file_handling/resources_reader");
const factories = require("../factories");
const expect = chai.expect;

describe("resources_reader", function() {
	describe("#getResource()", function() {
		const commandLineConfigs = JSON.parse(JSON.stringify(factories.command_line_configs));
		const resources = JSON.parse(JSON.stringify(factories.resources));
		it("converts a command line configuration object into a resources object", function() {
			commandLineConfigs.forEach(function(commandLineConfig, i) {
				const expected = resources[i];
				const actual = resources_reader.getResources(commandLineConfig);
				expect(expected).to.deep.equal(actual);
			});
		});
	});
});