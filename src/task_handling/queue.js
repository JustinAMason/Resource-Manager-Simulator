module.exports =

class Queue {

	constructor(tasks) {
		this.queue = tasks ? Object.keys(tasks) : [];
	}

	add(taskID) {
		this.queue.push(taskID);
	}

	remove() {
		const taskID = this.queue[0];
		if (this.queue.length > 0) {
			this.queue.shift();
			return taskID;
		}
	}

	set(queue) {
		if (Array.isArray(queue)) {
			this.queue = queue;
		}
	}

	getSortedTaskIDs() {
		return this.queue.slice().sort();
	}

	isEmpty() {
		return(this.queue.length == 0);
	}

	size() {
		return(this.queue.length);
	}

	toString() {
		console.log("" + this.queue);
	}

};