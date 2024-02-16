// @ts-check

/**
 * @param {string[]} args Process args (without executable and filename)
 * @returns {{tasks: import('./task').Task[]; options: Record<string, string>}}
 */
function parseArgs(args) {
    /** @type {import('./task').Task[]} */
    const tasks = [];
    /** @type {Record<string, string>} */
    const options = {};

    /** @type {import('./task').Task} */
    let current = {
        name: '',
        cmd: [],
    };
    for (const arg of args) {
        if (arg.endsWith(':')) {
            if (current.name) {
                tasks.push(current);
                current = {
                    name: '',
                    cmd: [],
                };
            }

            current.name = arg.substring(0, arg.length - 1);
            continue;
        }

        if (!current.name) {
            // common arg
            const [argName, value] = arg.split('=');
            const name = argName.startsWith('--') ? argName.substring(2) : argName;
            options[name] = value;
            continue;
        }

        current.cmd.push(arg);
    }

    if (current.name) {
        tasks.push(current);
    }

    return { tasks, options };
}

/**
 * @param {import('./task').Task[]} tasks
 */
function validateTasks(tasks) {
    if (!tasks.length) {
        console.error('No tasks were provided');
        process.exit(1);
    }

    let hasErrors = false;
    for (const task of tasks) {
        if (!task.cmd.length) {
            console.error(`Task "${task.name}" has empty command`);
            hasErrors = true;
        }
    }

    if (hasErrors) {
        process.exit(2);
    }
}

module.exports = { parseArgs, validateTasks };
