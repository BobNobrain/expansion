// @ts-check
const { bgRed, bgBlue, bgCyan, bgGreen, bgMagenta, bgYellow, green, blue, cyan } = require('kleur');

const TASK_NAME_COLORS = [bgBlue, bgCyan, bgGreen, bgYellow, bgMagenta, green, blue, cyan];

const STDOUT_ICON = bgBlue(' ');
const STDERR_ICON = bgRed('!');

/**
 * @param {string} data
 * @param {string} prefix
 * @returns {string[]}
 */
function getOutputLines(data, prefix) {
    return data.split('\n').map((line) => prefix + line);
}

/**
 * @param {string} name
 * @returns {string}
 */
function getColoredName(name) {
    let sum = 0x6b;
    for (let i = 0; i < name.length; i++) {
        const ch = name.charCodeAt(i) % 0xff;
        sum ^= ch;
    }

    const bg = TASK_NAME_COLORS[sum % TASK_NAME_COLORS.length];
    return bg(name);
}

/**
 * @param {import('child_process').ChildProcess} child
 * @param {import('./task').Task} task
 * @param {Record<string, string>} options
 * @returns {{coloredName: string}}
 */
function attachOutput(child, task, options) {
    const { prefix = '', suffix = '| ' } = options;
    const coloredName = getColoredName(task.name);
    const outPrefix = `${prefix}${STDOUT_ICON}${coloredName}${suffix}`;
    const errPrefix = `${prefix}${STDERR_ICON}${coloredName}${suffix}`;

    child.stdout?.on('data', (data) => {
        getOutputLines(data, outPrefix).map((line) => console.log(line));
    });
    child.stderr?.on('data', (data) => {
        getOutputLines(data, errPrefix).map((line) => console.error(line));
    });

    return { coloredName };
}

module.exports = { attachOutput };
