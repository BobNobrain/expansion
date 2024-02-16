// @ts-check
/**
 * @typedef {{
 *  name: string;
 *  cmd: string[];
 * }} Task
 */

const { exec } = require('child_process');
const { attachOutput } = require('./output');

/**
 * @param {Task} task
 * @returns {import('child_process').ChildProcess}
 */
function runTask(task) {
    const child = exec(task.cmd.join(' '));

    return child;
}

/**
 * @param {Task[]} tasks
 * @param {Record<string, string>} options
 */
function runCaesar(tasks, options) {
    /** @type {import('child_process').ChildProcess[]} */
    const children = [];

    process.on('beforeExit', () => {
        for (const child of children) {
            if (child.exitCode !== null) {
                continue;
            }

            child.kill();
        }
    });

    console.log(`Running ${tasks.length} tasks`);

    for (const task of tasks) {
        const child = runTask(task);
        const { coloredName } = attachOutput(child, task, options);

        child.on('exit', (code) => {
            for (const other of children) {
                if (other === child) {
                    continue;
                }

                if (other.exitCode !== null) {
                    continue;
                }
                other.kill();
            }

            if (code === 0) {
                console.log(`"${coloredName}" has exited`);
                process.exit(0);
            }

            console.error(`"${coloredName}" has exited with code ${code}`);
            process.exit(3);
        });

        children.push(child);
    }
}

module.exports = { runCaesar };
