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
		this.queue.shift();
		return taskID;
	}

	set(queue) {
		this.queue = queue;
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
		console.log(typeof this.queue);
		console.log("" + this.queue);
	}

};