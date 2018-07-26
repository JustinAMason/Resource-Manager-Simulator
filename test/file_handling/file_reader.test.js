const fs = require("fs");
const chai = require("chai");
const file_reader = require("../../src/file_handling/file_reader");
const factories = require("../factories");
const expect = chai.expect;

describe("file_reader", function() {
	describe("#readFile()", function() {
		context("valid file path given", function() {
			it("successfully reads and returns the provided file's contents", function() {
				const file = "test/test_input_files/input-03.txt";
				const expected = fs.readFileSync("test/test_input_files/input-03.txt", "utf8");
				const actual = file_reader.readFile(file, "test");
				expect(expected).to.deep.equal(actual);
			});
		});
		context("invalid file path given", function() {
			it("reads and returns the default file's contents (input_01)", function() {
				const file = "foo";
				const expected = fs.readFileSync("test/test_input_files/input-01.txt", "utf8");
				const actual = file_reader.readFile(file, "test");
				expect(expected).to.deep.equal(actual);
			});
		});
	});
});