const test = require("tape"); // assign the tape library to the variable "test"

test("OPTIMISTIC MANAGER", function (t) {
	t.equal(-1, [1,2,3].indexOf(4)); // 4 is not present in this array so passes
	t.end();
});