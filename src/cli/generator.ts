import {  type Model } from '../language/generated/ast.js';
/*import * as fs from 'node:fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';*/
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';

export function generateCommands(model: Model, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    /*const fileNode = new CompositeGeneratorNode();
    fileNode.append('"use strict";', NL, NL);
    model.greetings.forEach(greeting => fileNode.append(`console.log('Hello, ${greeting.person.ref?.name}!');`, NL));

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    */
    //const result: Object[] = generateStatements(model.statements);

    return generatedFilePath;
}

//type RobotLanguageGenEnv = Map<string,number>;
/*function generateStatements(statements: Statement[]): Object[] {
    let env : RobotLanguageGenEnv = new Map<string,number>();
    return statements.flatMap(s => evalStmt(s,env)).filter(e => e !== undefined) as Object[];
}*/

/*function evalStmt(s: Statement, env: RobotLanguageGenEnv): (Object | undefined)[] {
    throw new Error('Function not implemented.');
}*/

//type MiniLogoGenEnv = Map<string,number>;
/*
// evalutes exprs in the context of an env
function evalAdditionExpressionWithEnv(e: Expression, env: MiniLogoGenEnv): number {
    if(isNumberLiteral(e)) {
        return e.value;
    }
    if(isVariableReference(e)) {
        const v = env.get(e.variable.ref?.name ?? '');
        if (v !== undefined) {
            return v;
        }
        throw new Error(`Variable ${e.variable.ref?.name} not found`);
    }
    if(isBinExpr(e)) {
        const left = evalAdditionExpressionWithEnv(e.e1, env);
        const right = evalAdditionExpressionWithEnv(e.e2, env);
        switch(e.op) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            default: throw new Error(`Unknown operator ${e.op}`);
        }
    }
    if(e.ne) {
        return -1 * evalAdditionExpressionWithEnv(e.ne, env);
    }
    if(e.ge) {
        return evalAdditionExpressionWithEnv(e.ge, env);
    }
    throw new Error(`Unknown expression ${e}`);
}

function evalOrExpressionWithEnv(e: Expression, env: MiniLogoGenEnv): boolean {
    if(isBinExpr(e)) {
        const left = evalOrExpressionWithEnv(e.e1, env);
        const right = evalOrExpressionWithEnv(e.e2, env);
        switch(e.op) {
            case '||': return left || right;
            case '&&': return left && right;
            case '==': return left === right;
            case '!=': return left !== right;
            case '<': return left < right;
            case '<=': return left <= right;
            case '>': return left > right;
            case '>=': return left >= right;
            default: throw new Error(`Unknown operator ${e.op}`);
        }
    }
    if(e.ne) {
        return !evalOrExpressionWithEnv(e.ne, env);
    }
    if(e.ge) {
        return evalOrExpressionWithEnv(e.ge, env);
    }
    throw new Error(`Unknown expression ${e}`);
}
*/