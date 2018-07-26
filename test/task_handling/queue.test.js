const chai = require("chai");
const Queue = require("../../src/task_handling/queue");
const factories = require("../factories");
const expect = chai.expect;

describe("queue", function() {

	describe("#add()", function() {
		it("inserts the element at the end of the queue", function() {
			const queue = new Queue({});
			queue.add("foo");
			const expected = ["foo"];
			const actual = queue.queue;
			expect(expected).to.deep.equal(actual);
		});
	});

	describe("#remove()", function() {
		context("queue is empty", function() {
			it("does nothing", function() {
				const queue = new Queue({});
				queue.remove();
				const expected = [];
				const actual = queue.queue;
				expect(expected).to.deep.equal(actual);
			});
		});
		context("queue is not empty", function() {
			it("removes and returns the element at the front of the queue", function() {
				const queue = new Queue({"foo": {}});
				const expectedReturn = "foo";
				const actualReturn = queue.remove();
				const expectedQueue = [];
				const actualQueue = queue.queue;
				expect(expectedReturn).to.deep.equal(actualReturn);
				expect(expectedQueue).to.deep.equal(actualQueue);
			});
		});
	});

	describe("#set()", function() {
		it("sets the queue to the provided queue", function() {
			const queue = new Queue({});
			queue.set(["foo"]);
			const expected = ["foo"];
			const actual = queue.queue;
			expect(expected).to.deep.equal(actual);
		});
	});

	describe("#getSortedTaskIDs()", function() {
		it("returns a sorted array of the queue's contents", function() {
			const queue = new Queue({"8": 8, "1": 1, "4": 4});
			const expected = ["1", "4", "8"];
			const actual = queue.getSortedTaskIDs();
			expect(expected).to.deep.equal(actual);
		});
	});

	describe("#isEmpty()", function() {
		context("queue is empty", function() {
			it("returns true", function() {
				const queue = new Queue({});
				const expected = true;
				const actual = queue.isEmpty();
				expect(expected).to.deep.equal(actual);
			});
		});
		context("queue is not empty", function() {
			it("returns false", function() {
				const queue = new Queue({"foo": {}});
				const expected = false;
				const actual = queue.isEmpty();
				expect(expected).to.deep.equal(actual);
			});
		});
	});

	describe("#size()", function() {
		it("returns the size of the queue", function() {
			const queue = new Queue({"foo": {}});
			const expected = 1;
			const actual = queue.size();
			expect(expected).to.deep.equal(actual);
		});
	});

});