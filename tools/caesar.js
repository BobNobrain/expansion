// @ts-check
const { parseArgs, validateTasks } = require('./caesar/args');
const { runCaesar } = require('./caesar/task');

function main(args) {
    const { tasks, options } = parseArgs(args);
    validateTasks(tasks);

    runCaesar(tasks, options);
}

main(process.argv.slice(2));
