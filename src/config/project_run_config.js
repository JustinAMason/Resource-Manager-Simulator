module.exports = {
	getConfig
};

// BEGIN public interface

function getConfig(args, test) {
	const file = getFile(args[2]);
	const showOutput = getShowOutput(args[3]);

	if (!test) {
		reportConfiguration(file, showOutput);
	}
	
	return {"file": file, "show_output": showOutput};
}

// END public interface

function getFile(arg) {
	return arg ? arg : "../../sample_inputs/input-01.txt";
}

function getShowOutput(arg) {
	return(arg ? true : false);
}

function reportConfiguration(file, showOutput) {
	const outputVersion = getOutputVersion(showOutput);
	console.log(`\nFILE USED: ${file}\nOUTPUT VERSION: ${outputVersion}\n`);
}

function getOutputVersion(output) {
	return output ? "Detailed Output" : "Results Only";
}