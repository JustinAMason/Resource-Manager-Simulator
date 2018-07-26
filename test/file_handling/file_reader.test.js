const fs = require("fs");
const chai = require("chai");
const file_reader = require("../../src/file_handling/file_reader");
const factories = require("../factories");
const expect = chai.expect;

describe("file_reader", function() {
	describe("#readFile()", function() {
		context("valid file given", function() {
			it("should successfully read and return the file contents", function() {
				const file = "test/test_input_files/input-03.txt";
				const expected = fs.readFileSync("test/test_input_files/input-03.txt", "utf8");
				const actual = file_reader.readFile(file, "test");
				expect(expected).to.deep.equal(actual);
			});
		});
		context("invalid file path given", function() {
			it("should read and return the default (input_01) file contents", function() {
				const file = "foo";
				const expected = fs.readFileSync("test/test_input_files/input-01.txt", "utf8");
				const actual = file_reader.readFile(file, "test");
				expect(expected).to.deep.equal(actual);
			});
		});
	});
});