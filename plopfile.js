
const fs = require('fs')
const path = require('path')
const chalk = require('chalk');
const { parse, print, visit } = require("recast");
const recast_types = require("recast").types;

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
            const con_abs_path = path.join(process.cwd(), 'controllers', '{{name}}', '{{name}}.controller.js')
            const con_index_abs_path = path.join(process.cwd(), 'controllers', 'index.js')
            const routes_abs_path = path.join(process.cwd(), 'routes', '{{name}}.route.js')
            const models_abs_path = path.join(process.cwd(), 'models', '{{name}}.js')
            const actions = []
            console.log(args);
            console.log("PATH::" + con_abs_path);
            if (args.confirmed) {
                actions.push({
                    type: 'modify',
                    path: con_index_abs_path,
                    transform: (source, args) => {

                        let ast = parse(source)
                        let body = ast.program.body

                        //Get end of require statements to append
                        let require_statement_start_found
                        const entity_var = plop.handlebars.helpers.snakeCase(args.name) + "_controller"
                        let indexNew
                        for (let [i, x] of body.entries()) {
                            try {
                                if (!require_statement_start_found && is_require_statement(x, entity_var)) {
                                    require_statement_start_found = true
                                }
                                if (require_statement_start_found && !is_require_statement(x, entity_var)) {
                                    indexNew = i
                                    break;
                                }
                            } catch (error) {
                                indexNew = -1
                                break
                            }
                        }
                        //Append new require statement
                        const node_new = generate_require_statement(entity_var, `./${args.name}/${args.name}.controller`)
                        if (indexNew !== -1) {
                            body.splice(indexNew, 0, node_new);
                        }

                        // Search and edit module.exports
                        add_module_exports(body, entity_var)

                        ast.program.body = body
                        // console.log(ast.program.body[0].declarations[0].init);
                        // console.log(print(ast).code);
                        return print(ast).code
                    }
                })
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

    const is_require_statement = (ast, var_name) => {
        const is_require = (ast.type == "VariableDeclaration"
            && ast.declarations.length > 0
            && ast.declarations[0].init
            && ast.declarations[0].init.type === "CallExpression"
            && ast.declarations[0].init.callee
            && ast.declarations[0].init.callee.name === "require")
        if (is_require && ast.declarations[0].init.arguments[0].value === var_name) {
            throw "require statement already exists"
        }
        return is_require
    }

    const generate_require_statement = (var_name, require_path) => {
        const b = recast_types.builders;
        return nodeX = b.variableDeclaration("const", [
            b.variableDeclarator(
                b.identifier(var_name),
                // b.literal(0)
                b.callExpression(b.identifier('require'), [b.literal(require_path)])
            )
        ]);
    }

    const add_module_exports = (ast_node, var_name) => {
        visit(ast_node, {
            visitExpressionStatement: function (path) {

                if (path.getValueProperty("expression").type === "AssignmentExpression"
                    && path.getValueProperty("expression").left.object.name === "module"
                    && path.getValueProperty("expression").left.property.name === "exports"
                ) {
                    const b = recast_types.builders;
                    //check if already exported
                    const already_exported = path.getValueProperty("expression").right.properties.filter(prop => {
                        return prop.key.name === var_name
                    }).length > 0
                    if (!already_exported) {
                        path.getValueProperty("expression").right.properties.push(b.identifier(var_name))
                    }
                    this.traverse(path);
                }
                return false
            }
        });
    }
};