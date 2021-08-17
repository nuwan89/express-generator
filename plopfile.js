
const fs = require('fs')
const path = require('path')
const chalk = require('chalk');

module.exports = function (plop) {



    plop.setActionType('express', function (answers, config, plop) {

        // const express_base = fs.readdirSync(process.cwd(), { withFileTypes: true })
        //     .filter(d => d.isDirectory())
        //     .map(d => d.name)
        //     .filter(name => {
        //         console.log(name);
        //         return name == "config"
        //     }).length == 0
        // if (express_base) {
        //     console.log("EXPRESS config dir not found! cd into expresss base dir Eg: cd server - a directory name 'config' folder must exist");
        //     throw 'express config dir not found!';
        // }
        console.log(chalk.cyan(`Using base dir: ${process.cwd()}`));
        console.log(config);

        console.log(base_files);
        console.log(config.pathx);

        // throw 'error message';
        // otherwise
        return 'success status message';
    });

    // // or do async things inside of an action
    // plop.setActionType('doTheAsyncThing', function (answers, config, plop) {
    // 	// do something
    // 	return new Promise((resolve, reject) => {
    // 		if (success) {
    // 			resolve('success status message');
    // 		} else {
    // 			reject('error message');
    // 		}
    // 	});
    // });

    plop.setGenerator('route', {
        description: 'Generate new express rest route',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'REST CRUD Entity Name'
            },
            {
                type: 'confirm',
                name: 'confirmed',
                default: true,
                message: 'Write files to disk'
            }
        ],
        
        actions: (args) => {
            const con_abs_path = path.join(process.cwd(), 'controllers','{{name}}', '{{name}}.controller.js')
            // const con_index_abs_path = path.join(process.cwd(), 'controllers', 'index.js')
            const routes_abs_path = path.join(process.cwd(), 'routes', '{{name}}.route.js')
            const models_abs_path = path.join(process.cwd(), 'models', '{{name}}.js')
            const actions = []
            console.log(args);
            console.log("PATH::" + con_abs_path);
            if(args.confirmed) {
                actions.push({
                    type: 'add',
                    path: models_abs_path,
                    templateFile: './templates/model.hbs',
                })
                actions.push({
                    type: 'add',
                    path: con_abs_path,
                    templateFile: './templates/controller.hbs',
                })
                // actions.push({
                //     type: 'modify',
                //     path: con_index_abs_path,
                //     // transform: (text,args)=>{
                //     //     console.log(args);
                //     // }
                // })
                actions.push({
                    type: 'add',
                    path: routes_abs_path,
                    templateFile: './templates/route.hbs',
                })
            }
            // if(params)
            return actions
        },
        
        // actions: [{
        //     type: 'add',
        //     path: './src/{{name}}.controller.js',
        //     templateFile: './templates/controller.hbs',
        //     data: (x, y, z) => {
        //         console.log(x);
        //         console.log(y);
        //         console.log(z);
        //         return {}
        //     }
        // }]
        // actions: [{
        //     type: 'add',
        //     path: 'src/main.js',
        //     trans
        //     template: 'console.log("Hello, World!");'
        // }]
    });
};