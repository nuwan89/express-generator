
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

    plop.setGenerator('sync', {
        description: 'Sync migration with model',
        prompts: [
            {
                type: 'input',
                name: 'model',
                message: 'Model file path'
            },
            {
                type: 'input',
                name: 'migration',
                message: 'Migration file path'
            },
            // {
            //     type: 'input',
            //     name: 'migration',
            //     message: 'Migration file path'
            // },
        ],
        actions: (args) => {
            const actions = []
            console.log(args);
            const model_abs_path = path.join(process.cwd(), args.model)
            //////////////////////// BUILT AST MODEL ////////////////////
            const source = fs.readFileSync(model_abs_path, { encoding: "utf-8" })
            let model_ast = parse(source)
            let model_body = model_ast.program.body
            let model_properties = {}
            let model_source_var_name
            visit(model_body, { // Read model properties
                visitCallExpression: (path) => {
                    if (path.node.callee.object.name === "sequelize" && path.node.callee.property.name === "define") {
                        // console.log("++++++++++++++++++++++++++++++++++++++++++");
                        // console.log(chalk.magenta(path.node.callee));
                        // model_source_var_name => to filter associations
                        model_source_var_name = path.parent.value.id.name // Eg: CaseFile => const CaseFile = sequelize.define(..)
                        const [model_def_id, model_field_obj] = path.node.arguments
                        model_properties = model_field_obj.properties
                    }
                    return false
                }
            })
            const relation_details = []
            visit(model_body, { //Read entity relationships
                visitCallExpression: (path) => {
                    if (path.node.callee.object.name === model_source_var_name) {
                        // if (path.node.callee.object.name === model_source_var_name && path.node.callee.property.name === "define") {
                        console.log(chalk.yellowBright(path.node.callee.property.name));
                        // console.log(path.node.arguments);
                        relation_details.push({...get_js_obj_from_associations(path.node.arguments), relationship: path.node.callee.property.name})
                    }

                    return false
                }
            })

            const model_fields = get_model_fields_from_properties(model_properties)
            console.log(relation_details);
            const migrations_abs_path = path.join(process.cwd(), args.migration)
            actions.push({ //Update migration file with fields and relationships
                type: 'modify',
                path: migrations_abs_path,
                transform: (source, args) => {

                    let ast = parse(source)
                    let body = ast.program.body

                    //Get QueryInterface variable name:
                    // visit(body, {
                    //     visitFunction: function (path) {
                    //         console.log(chalk.bgGreen("func"));
                    //         console.log(path.node.params[0].name);
                    //         if(path.node.params[0] === '') {

                    //         }
                    //         // return false
                    //         this.traverse(path)
                    //     },
                    //     visitFunctionDeclaration: (path) => {
                    //         console.log(chalk.bgGreen("-------------------------dec"));
                    //         return false
                    //     },
                    //     visitFunctionExpression: (path) => {
                    //         console.log(chalk.bgGreen("exp"));
                    //         return false
                    //     }
                    // })

                    visit(body, {
                        visitCallExpression: (path) => {
                            if (path.node.callee.object.name === 'queryInterface' && path.node.callee.property.name === 'createTable') {
                                console.log(chalk.bgGreen("MIGRATION AST CALL EXP"));
                                console.log(path.node.arguments[1]);
                                //Get feilds in model
                                const existing_fields_in_migration = get_fields_from_migration_create_table_arg(model_fields, relation_details, path.node.arguments[1].properties)
                                model_fields.forEach(field => {

                                })
                            }
                            return false
                        }
                    })
                    // ast.program.body = body
                    // console.log(ast.program.body[0].declarations[0].init);
                    console.log("================== MIGRATION =====================");
                    console.log(print(ast).code);
                    return print(ast).code
                }
            })

            // actions = []

            // visit(model_body, {
            //     visitAssignmentExpression: function (path) {
            //         // console.log(path.node.right);
            //         if (path.node.left.object.name === "module") {
            //             // console.log("=====================================++=========================");
            //             this.traverse(path)
            //             // console.log("=====================================++=========================");
            //         }
            //         if (path.node.left.object.name === model_source_var_name && path.node.left.property.name === 'associate') {
            //             console.log("==============================================================");
            //             console.log(path.node.left.property.name);
            //             console.log(path.node.left.object.name);
            //             console.log(chalk.cyan("Its an as"));
            //             console.log(path);
            //             this.traverse(path)
            //         }
            //         return false
            //         // this.visit(path)
            //     }
            // })
            // console.log(body);
            //////////////////////// BUILT AST MODEL END ////////////////////
            // const migration_abs_path = path.join(process.cwd(), args.migration)
            // console.log(migration_abs_path);
            // actions.push({
            //     type: 'modify',
            //     path: migration_abs_path,
            //     transform: (source) => {

            //         let ast = parse(source)
            //         let body = ast.program.body
            //     }
            // })
            return actions
        }

    })

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

    const get_fields_from_migration_create_table_arg = (model_fields, relation_details, migration_field_properties) => {
        const fields = []
        // console.log(model_fields);
        console.log(chalk.bgMagenta("xxxxxxxxxxxxxx"));
        console.log(relation_details);
        console.log(chalk.bgMagenta("xxxxxxxxxxxxxx"));
        const b = recast_types.builders
        
        model_fields.forEach(model_field => {
            // console.log(model_field.name);
            let existing_migration_field = migration_field_properties.filter(mig_prop => mig_prop.key.name === model_field.name)
            
            if (existing_migration_field.length === 1) { //Model field exists in migration file
                existing_migration_field = existing_migration_field[0]
                // console.log("(((((((((((((((((((((((((((((((((((((((****_UUUUUU=");
                
                // Set data type
                let migration_field_data_type = existing_migration_field.value.properties.filter(migration_field_prop => migration_field_prop.key.name === "type");
                if(migration_field_data_type.length == 1){
                    migration_field_data_type = migration_field_data_type[0]
                    
                    migration_field_data_type.value.property.name = model_field.data_type
                    
                } else { //Add missing type attribute to already existing field in migration
                    // console.log(chalk.greenBright("Properties of migration field: " + model_field.name));
                    let type_property = b.property('init', b.identifier("type"), b.memberExpression(b.identifier("Sequelize"), b.identifier(model_field.data_type)))//TODO: Change the hardcoded Sequelize
                    // type_property.value = b.mem
                    // console.log(type_property);
                    existing_migration_field.value.properties.push(type_property)
                    // console.log("(((((((((((((((((((((((((((((((((((((((****");
                }
                // Update foregn key constraints if defined
                let foreign_key_relationship = relation_details.filter(r => r.foreignKey == model_field.name)
                if(foreign_key_relationship.length == 1){
                    foreign_key_relationship = foreign_key_relationship[0]
                    // Check if relationship exists in migration field
                    let migration_field_relationship = existing_migration_field.value.properties.filter(migration_field_prop => migration_field_prop.key.name === "references");
                    console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
                    console.log(migration_field_relationship);
                }
                // for (let model_relation in relation_details) {
                //     if(model_relation.relationship == 'belongsTo') { //Add foreign key
                //         // Edit 
                //     }
                // }
            } else { //No entry in migration - needs to add missing new property/field
                let type_property = b.property('init', b.identifier("type"), b.memberExpression(b.identifier("Sequelize"), b.identifier(model_field.data_type)))//TODO: Change the hardcoded Sequelize
                let new_field = b.property('init', b.identifier(model_field.name), b.objectExpression([type_property]))
                migration_field_properties.push(new_field)
            }

            // fields.push({name: model_field.key.name, val: model_field.value.properties    })
        });

        // console.log(migration_field_properties[0].value.properties[0]);

        return migration_field_properties
        
    }

    const get_migration_foreign_object = () => {

    }

    const get_model_fields_from_properties = (properties) => {
        const fields = []
        properties.forEach(prop => {
            fields.push({ name: prop.key.name, data_type: prop.value.property.name })
            // console.log(`${prop.key.name}: ${prop.value.object.name}.${prop.value.property.name}`);
        });
        // console.log(field_obj);
        return fields
    }

    const get_js_obj_from_associations = (association_args) => {

        console.log(chalk.blueBright("****************"));
        console.log(association_args);
        console.log(chalk.blueBright("****************"));

        let relation_details = {}
        const [related_entity, relation_obj_expression] = association_args
        relation_details.foreign_entity = related_entity.property.name

        relation_obj_expression.properties.forEach(prop => {
            relation_details[prop.key.name] = prop.value.value
        })

        // console.log(chalk.yellowBright(JSON.stringify(relation_details)));

        return relation_details
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