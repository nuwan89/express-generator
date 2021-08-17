#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const args = process.argv.slice(2);
const {Plop, run} = require('plop');
const argv = require('minimist')(args);

console.log(chalk.cyan("Express generator made by Zirconlabz [@slimkit-ui/express-generator]"));

Plop.launch({
  cwd: argv.cwd,
  // In order for `plop` to always pick up the `plopfile.js` despite the CWD, you must use `__dirname`
  configPath: path.join(__dirname, 'plopfile.js'),
  require: argv.require,
  completion: argv.completion
// This will merge the `plop` argv and the generator argv.
// This means that you don't need to use `--` anymore
// }, env => run(env, undefined, true));
}, env => {
    const options = {
        ...env,
        dest: process.cwd() // this will make the destination path to be based on the cwd when calling the wrapper
    }
    return run(options, undefined, true)
});