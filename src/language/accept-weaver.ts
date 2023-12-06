import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { isAssignment, isBinExpr, isBooleanLiteral, isFunct, isFunctionCallStatement, isIfStatement, isNumberLiteral, isVariableDeclaration, isVariableReference, isWhileLoop, type RobotLanguageAstType } from './generated/ast.js';
import * as InterfaceAST from './generated/ast.js';
import * as ClassAST from './visitor.js';
import { RoboMLVisitor } from './visitor.js';
import type { RobotLanguageServices } from './robot-language-module.js';

/**
 * Register custom validation checks.
 * TODO : Call this function in the language module.ts file (see registerValidationChecks(...);)
 */
export function weaveAcceptMethods(services: RobotLanguageServices) {
    const registry = services.validation.ValidationRegistry;
    const weaver = services.validation.RoboMlAcceptWeaver
    registry.register(weaver.checks, weaver);
}

/**
 * TODO :
 * You must implement a weaving function for each concrete concept of the language.
 * you will also need to fill the check data structure to map the weaving function to the Type of node
 */
export class RoboMlAcceptWeaver {
    checkUniqueDefs(model : InterfaceAST.Model, accept : ValidationAcceptor) : void{
        (<any> model).accept = (visitor: RoboMLVisitor) => {return visitor.visitModelimpl(model as unknown as ClassAST.Modelimpl);}
        model.functions.forEach(f => {
        });
        const reported = new Set();
        model.functions.forEach(d => {
            if (reported.has(d.name)) {
                accept('error',  `Def has non-unique name '${d.name}'.`,  {node: d, property: 'name'});
            }
            reported.add(d.name);
        });
        if(!reported.has("entry")){
            accept('warning', 'Model don\'t have entry() function.', {node: model, property: 'functions'});
        }
    }

    checkUniqueVarInFun(def: InterfaceAST.Funct, accept: ValidationAcceptor): void {
        (<any> def).accept = (visitor: RoboMLVisitor) => {return visitor.visitFunctImpl(def as unknown as ClassAST.FunctImpl);}
        const reported = new Set();
        def.parameters.forEach(p => {
            if(isVariableDeclaration(p)){
                if (reported.has(p.name)) {
                    accept('error', `Param ${p.name} is non-unique for Def '${def.name}'`, {node: p, property: 'name'});
                }
                reported.add(p.name);
            }
        });
    }

    checkUniqueParams(funct: InterfaceAST.Funct, accept: ValidationAcceptor): void {
        (<any> funct).accept = (visitor: RoboMLVisitor) => {return visitor.visitFunctImpl(funct as unknown as ClassAST.FunctImpl);}
        const reported = new Set();
        funct.body.forEach(s => {
            if(isVariableDeclaration(s)){
                if (reported.has(s.name)) {
                    accept('error',  `Varuable has non-unique name '${s.name}'.`,  {node: s, property: 'name'});
                }
                reported.add(s.name);
            }
            if(isWhileLoop(s)){
                s.body.forEach(b => {
                    if(isVariableDeclaration(b)){
                        if (reported.has(b.name)) {
                            accept('error',  `Varuable has non-unique name '${b.name}'.`,  {node: b, property: 'name'});
                        }
                        reported.add(b.name);
                    }
                })
            }
            
        });
    }

    checkVariableDeclaration(funct: InterfaceAST.Funct, accept: ValidationAcceptor): void {
        (<any> funct).accept = (visitor: RoboMLVisitor) => {return visitor.visitFunctImpl(funct as unknown as ClassAST.FunctImpl);}
        const declaredVariables = new Set();
        funct.body.forEach(v => {
            if(isVariableDeclaration(v)){
                declaredVariables.add(v.name);
            }
        });

        funct.body.forEach(s => {
            if (isAssignment(s)) {
                const ref = s.variable.ref?.name;
                if (ref && !declaredVariables.has(ref)) {
                    accept('error', `Variable ${ref} is used but not declared.`, {node: s, property: 'variable'});
                }
            }
        });
    }

    checkFunctionCall(model: InterfaceAST.Model, accept: ValidationAcceptor): void {
        (<any> model).accept = (visitor: RoboMLVisitor) => {return visitor.visitModelimpl(model as unknown as ClassAST.Modelimpl);}
        const declaredFunctions = new Set();
        model.functions.forEach(f => {
            declaredFunctions.add(f.name);
        });

        model.functions.forEach(s => {
            s.body.forEach(p => {
                if (isFunctionCallStatement(p)) {
                    const ref = p.function.ref;
                    if (ref && !declaredFunctions.has(ref)) {
                        accept('error', `Function ${ref.name} is called but not declared1.`, {node: ref, property: 'name'});
                    }
                }
            })
        });
    }

    //verifie si le type d'une variable est correct
    checkType(variableDeclaration: InterfaceAST.VariableDeclaration, accept: ValidationAcceptor): void {
        (<any> variableDeclaration).accept = (visitor: RoboMLVisitor) => {return visitor.visitVariableDeclarationImpl(variableDeclaration as unknown as ClassAST.VariableDeclarationImpl);}
        const type = variableDeclaration.type
        if (type !== "number" && type !== "bool" && type !== "string") {
            accept('error', `Type ${type} is not correct.`, {node: variableDeclaration, property: 'type'});
        }
    }

    //verifie si le type d'une variable assignée est correct
    checkTypeVariableDeclaration(variableDeclaration: InterfaceAST.VariableDeclaration, accept: ValidationAcceptor): void {
        (<any> variableDeclaration).accept = (visitor: RoboMLVisitor) => {return visitor.visitVariableDeclarationImpl(variableDeclaration as unknown as ClassAST.VariableDeclarationImpl);}
        const type = variableDeclaration.type
        const initExpr = variableDeclaration.initialValue
        if(initExpr!==undefined && isBinExpr(initExpr)){
            const left = initExpr.e1
            const right = initExpr.e2
            if(isVariableReference(left)){
                if (left.variable.ref?.type !== type) {
                    accept('error', `Type ${type} is not correct.`, {node: variableDeclaration, property: 'type'});
                }
            }
            if(isVariableReference(right)){
                if (right.variable.ref?.type !== type) {
                    accept('error', `Type ${type} is not correct.`, {node: variableDeclaration, property: 'type'});
                }
            }
            if(isNumberLiteral(left)){
                if (type !== "number") {
                    accept('error', `Type ${type} is not correct.`, {node: variableDeclaration, property: 'type'});
                }
            }
            if(isBooleanLiteral(left)){
                if (type !== "bool") {
                    accept('error', `Type ${type} is not correct.`, {node: variableDeclaration, property: 'type'});
                }
            }
        }
        if(initExpr && isNumberLiteral(initExpr)){
            if (type !== "number") {
                accept('error', `Type ${type} is not correct.`, {node: variableDeclaration, property: 'type'});
            }
        }
        if(initExpr && isBooleanLiteral(initExpr)){
            if (type !== "bool") {
                accept('error', `Type ${type} is not correct.`, {node: variableDeclaration, property: 'type'});
            }
        }
        if(isFunctionCallStatement(initExpr)){
            const ref = initExpr.function.ref;
            if(ref && ref.funcReturns === "void"){
                accept('error', `Function ${ref.name} return void.`, {node: ref, property: 'name'});
            }
            if(ref && ref.funcReturns !== type){
                accept('error', `Function ${ref.name} return ${ref.funcReturns} and not ${type}.`, {node: ref, property: 'name'});
            }
        }
        
    }
    
    checkTypeAssigment(assignment: InterfaceAST.Assignment, accept: ValidationAcceptor): void {
        (<any> assignment).accept = (visitor: RoboMLVisitor) => {return visitor.visitAssignmentImpl(assignment as unknown as ClassAST.AssignmentImpl);}
        const type = assignment.variable.ref?.type

        const assigExpr = assignment.expression
        if(assigExpr && isBinExpr(assigExpr)){
            const left = assigExpr.e1
            const right = assigExpr.e2
            if(isVariableReference(left)){
                if (left.variable.ref?.type !== type) {
                    accept('error', `Type ${type} is not correct.`, {node: assignment, property: 'variable'});
                }
            }
            if(isVariableReference(right)){
                if (right.variable.ref?.type !== type) {
                    accept('error', `Type ${type} is not correct.`, {node: assignment, property: 'variable'});
                }
            }
            if(isNumberLiteral(left)){
                if (type !== "number") {
                    accept('error', `Type ${type} is not correct.`, {node: assignment, property: 'variable'});
                }
            }
            if(isBooleanLiteral(left)){
                if (type !== "bool") {
                    accept('error', `Type ${type} is not correct.`, {node: assignment, property: 'variable'});
                }
            }
        }
        if(assigExpr && isNumberLiteral(assigExpr)){
            if (type !== "number") {
                accept('error', `Type ${type} is not correct.`, {node: assignment, property: 'variable'});
            }
        }
        if(assigExpr && isBooleanLiteral(assigExpr)){
            if (type !== "bool") {
                accept('error', `Type ${type} is not correct.`, {node: assignment, property: 'variable'});
            }
        }
        if(isFunctionCallStatement(assigExpr)){
            const ref = assigExpr.function.ref;
            if(ref && ref.funcReturns === "void"){
                accept('error', `Function ${ref.name} return void.`, {node: ref, property: 'name'});
            }
            if(ref && ref.funcReturns !== type){
                accept('error', `Function ${ref.name} return ${ref.funcReturns} and not ${type}.`, {node: ref, property: 'name'});
            }
        }
    }

    checkTypeFunctReturn(funct: InterfaceAST.Funct, accept: ValidationAcceptor): void {
        (<any> funct).accept = (visitor: RoboMLVisitor) => {return visitor.visitFunctImpl(funct as unknown as ClassAST.FunctImpl);}
        const returnType = funct.funcReturns
        const returnExpr = funct.returnValue
        
        if (returnType !== "number" && returnType !== "bool" && returnType !== "string" && returnType !== "void") {
            accept('error', `Type ${returnType} is not correct.`, {node: funct, property: 'returnValue'});
        }
        if(isVariableReference(returnExpr)){
            if (returnExpr.variable.ref?.type !== returnType) {
                accept('error', `Type ${returnType} is not correct.`, {node: funct, property: 'returnValue'});
            }
        }
        if(isNumberLiteral(returnExpr)){
            if (returnType !== "number") {
                accept('error', `Type ${returnType} is not correct.`, {node: funct, property: 'returnValue'});
            }
        }
        if(isBooleanLiteral(returnExpr)){
            if (returnType !== "bool") {
                accept('error', `Type ${returnType} is not correct.`, {node: funct, property: 'returnValue'});
            }
        }
        if(isBinExpr(returnExpr)){
            const left = returnExpr.e1
            const right = returnExpr.e2
            if(isVariableReference(left)){
                if (left.variable.ref?.type !== returnType) {
                    accept('error', `Type ${returnType} is not correct.`, {node: funct, property: 'returnValue'});
                }
            }
            if(isVariableReference(right)){
                if (right.variable.ref?.type !== returnType) {
                    accept('error', `Type ${returnType} is not correct.`, {node: funct, property: 'returnValue'});
                }
            }
            if(isNumberLiteral(left)){
                if (returnType !== "number") {
                    accept('error', `Type ${returnType} is not correct.`, {node: funct, property: 'returnValue'});
                }
            }
            if(isBooleanLiteral(left)){
                if (returnType !== "bool") {
                    accept('error', `Type ${returnType} is not correct.`, {node: funct, property: 'returnValue'});
                }
            }
        }
        
    }

    //verifie  si le type de retour est void alors on ne doit pas avoir de return
    checkVoidReturn(funct: InterfaceAST.Funct, accept: ValidationAcceptor): void {
        (<any> funct).accept = (visitor: RoboMLVisitor) => {return visitor.visitFunctImpl(funct as unknown as ClassAST.FunctImpl);}
        const returnType = funct.funcReturns
        const returnExpr = funct.returnValue
        if(returnType !== "void" && returnExpr === undefined){
            accept('error', `Type ${returnType} is not correct.`, {node: funct, property: 'returnValue'});
        }
    }
    
    // verifie l'unité lors de l'appel à un InternalFunctionCall
/*
    checkUnitInternalFunctionCall(internalFunctionCall: InterfaceAST.InternalFunctionCall, accept: ValidationAcceptor): void {
        (<any> internalFunctionCall).accept = (visitor: RoboMLVisitor) => {return visitor.visitConcept(internalFunctionCall as unknown as ClassAST.Modelimpl);}
        if(isDeplacement(internalFunctionCall)){
            const unit = internalFunctionCall.unit
            if(unit !== "mm" && unit !== "cm" && unit !== "m"){
                accept('error', `Unit ${unit} is not correct.`, {node: internalFunctionCall, property: 'unit'});
            }
        }
        if(isSetting(internalFunctionCall)){
            const unit = internalFunctionCall.unit
            if(unit !== "mm" && unit !== "cm" && unit !== "m"){
                accept('error', `Unit ${unit} is not correct.`, {node: internalFunctionCall, property: 'unit'});
            }
        }
    }*/
    /*
    checkUnitDeplacement(deplacement: InterfaceAST.Deplacement, accept: ValidationAcceptor): void {
        (<any> deplacement).accept = (visitor: RoboMLVisitor) => {return visitor.visitConcept(deplacement as unknown as ClassAST.DeplacementImpl);}
        const unit = deplacement.unit
        const unit2 = deplacement.unit2
        
        if(unit !== undefined && unit !== "mm" && unit !== "cm" && unit !== "m"){
            accept('error', `Unit ${unit} is not correct.`, {node: deplacement, property: 'unit'});
        }
        if(unit2 !== undefined && unit2 !== "mm" && unit2 !== "cm" && unit2 !== "m"){
            accept('error', `Unit ${unit2} is not correct.`, {node: deplacement, property: 'unit2'});
        }
    }*/

    checkUnitSetting(setting: InterfaceAST.Setting, accept: ValidationAcceptor): void {
        (<any> setting).accept = (visitor: RoboMLVisitor) => {return visitor.visitSettingImpl(setting as unknown as ClassAST.SettingImpl);}
        const unit = setting.unit
        if((unit !== "mm" && unit !== "cm" && unit !== "m")){
            accept('error', `Unit ${unit} is not correct.`, {node: setting, property: 'unit'});
        }
    }

    // verifie si toutes les fonctions sont appelées au moins une fois
    checkisFunctionCall(model: InterfaceAST.Model, accept: ValidationAcceptor){
        (<any> model).accept = (visitor: RoboMLVisitor) => {return visitor.visitModelimpl(model as unknown as ClassAST.Modelimpl);}
        //Faire une liste des noms de variables déclarées
        const declaredFunctions = new Set();

        model.functions.forEach(f => {
            declaredFunctions.add(f);
        });
        // Faire la liste des fonction utilisées
        const usedFunctions = new Set();
        model.functions.forEach(s => {
            s.body.forEach(p => {
                if(isWhileLoop(p)){
                    p.body.forEach(b => {
                        if (isFunctionCallStatement(b)) {
                            const ref = b.function.ref;
                            usedFunctions.add(ref);
                        }
                    })
                }
                if (isFunctionCallStatement(p)) {
                    const ref = p.function.ref;
                    usedFunctions.add(ref);
                }
                if (isAssignment(p) && isFunctionCallStatement(p.expression)) {
                    const ref = p.expression.function.ref;
                usedFunctions.add(ref);
                }
            })
        });
        // verifie que toutes les fonctions de declaredFunctions sont dans usedFunctions
        declaredFunctions.forEach(f => {
            if(isFunct(f)){
                if(!usedFunctions.has(f)){
                    if(f.name !== "entry"){
                        accept('warning', `Function ${f.name} is not called.`, {node: f, property: 'name'});
                    }
                }
            }
        });
        
    }

    // verifie si toutes les variables sont utilisées au moins une fois
    checkisVariableDeclaration(model: InterfaceAST.Model, accept: ValidationAcceptor){
        (<any> model).accept = (visitor: RoboMLVisitor) => {return visitor.visitModelimpl(model as unknown as ClassAST.Modelimpl);}
        //Faire une liste des noms de variables déclarées
        const declaredVariables = new Set();

        model.functions.forEach(f => {
            f.body.forEach(s => {
                if(isVariableDeclaration(s)){
                    declaredVariables.add(s.name);
                }
                if(isWhileLoop(s)){
                    s.body.forEach(b => {
                        if(isVariableDeclaration(b)){
                            declaredVariables.add(b.name);
                        }
                    })
                }
            })
        });
        // Faire la liste des variables utilisées
        const usedVariables = new Set();
        model.functions.forEach(s => {
            s.body.forEach(p => {
                if (isAssignment(p)) {
                    const ref = p.variable.ref;
                    usedVariables.add(ref);
                }
            })
        });
        // verifie que toutes les variables de declaredVariables sont dans usedVariables
        declaredVariables.forEach(v => {
            if(isVariableDeclaration(v)){
                if(!usedVariables.has(v)){
                    accept('warning', `Variable ${v.name} is not used.`, {node: v, property: 'name'});
                }
            }
        });
        
    }

    // verifie si la condition dans un if statement ou un while loop est un boolean ou un or expression
    checkisBooleanExpression(model: InterfaceAST.Model, accept: ValidationAcceptor){
        (<any> model).accept = (visitor: RoboMLVisitor) => {return visitor.visitModelimpl(model as unknown as ClassAST.Modelimpl);}
        model.functions.forEach(f => {
            f.body.forEach(s => {
                if(isWhileLoop(s) || isIfStatement(s)){
                    const condition = s.condition
                    if(isBinExpr(condition) && (condition.op === "||" || condition.op === "&&" || condition.op === "==" || condition.op === "!=" || condition.op === "<" || condition.op === "<=" || condition.op === ">" || condition.op === ">=")){
                        const left = condition.e1
                        const right = condition.e2
                        if(isVariableReference(left)){
                            if (left.variable.ref?.type !== "bool") {
                                accept('error', `Type ${left.variable.ref?.type} is not correct.`, {node: s, property: 'condition'});
                            }
                        }
                        if(isVariableReference(right)){
                            if (right.variable.ref?.type !== "bool") {
                                accept('error', `Type ${right.variable.ref?.type} is not correct.`, {node: s, property: 'condition'});
                            }
                        }
                        if(isNumberLiteral(left)){
                            accept('error', `Type number is not correct.`, {node: s, property: 'condition'});
                        }
                    }
                    else{
                        accept('error', `Type boolean is not correct.`, {node: s, property: 'condition'});
                    }
                    if(isVariableReference(condition)){
                        if (condition.variable.ref?.type !== "bool") {
                            accept('error', `Type ${condition.variable.ref?.type} is not correct.`, {node: s, property: 'condition'});
                        }
                    }
                    if(isNumberLiteral(condition)){
                        accept('error', `Type number is not correct.`, {node: s, property: 'condition'});
                    }
                }
            })
        });
    }
/*
    checkisBooleanExpression2(controlStatement: InterfaceAST.ControlStatement, accept: ValidationAcceptor){
        (<any> controlStatement).accept = (visitor: RoboMLVisitor) => {return visitor.visitConcept(controlStatement as unknown as ClassAST.Modelimpl);}
        if(isWhileLoop(controlStatement) || isIfStatement(controlStatement)){
            const condition = controlStatement.condition
            if(isBinExpr(condition)){
                if(condition.op ==="+" || condition.op === "-" || condition.op ==="*" || condition.op === "/"){
                    accept('error', `Type number is not correct.`, {node: controlStatement, property: 'condition'});
                }
            }
            if(isVariableReference(condition)){
                if (condition.variable.ref?.type !== "bool") {
                    accept('error', `Type ${condition.variable.ref?.type} is not correct.`, {node: controlStatement, property: 'condition'});
                }
            }
            if(isNumberLiteral(condition)){
                accept('error', `Type number is not correct.`, {node: controlStatement, property: 'condition'});
            }
            if(isFunctionCallStatement(condition)){
                const ref = condition.function.ref;
                if(ref && ref.funcReturns !== "bool"){
                    accept('error', `Function ${ref.name} return ${ref.funcReturns} and not bool.`, {node: ref, property: 'name'});
                }
            }
            if(isBooleanLiteral(condition)){
                if (condition.value !== true && condition.value !== false) {
                    accept('error', `Type boolean is not correct.`, {node: controlStatement, property: 'condition'});
                }
            }
            if(isBinExpr(condition) && condition.ne){
                if(condition.op ==="+" || condition.op === "-" || condition.op ==="*" || condition.op === "/"){
                    accept('error', `Type number is not correct.`, {node: controlStatement, property: 'condition'});
                }
                if(isNumberLiteral(condition.ne)){
                    accept('error', `Type number is not correct.`, {node: controlStatement, property: 'condition'});
                }
            }
        }
    }*/

    checkisBooleanExpression3(whileLoopStatement: InterfaceAST.WhileLoop, accept: ValidationAcceptor){
        (<any> whileLoopStatement).accept = (visitor: RoboMLVisitor) => {return visitor.visitWhileLoopImpl(whileLoopStatement as unknown as ClassAST.WhileLoopImpl);}
        const condition = whileLoopStatement.condition
        if(isBinExpr(condition)){
            if(condition.op ==="+" || condition.op === "-" || condition.op ==="*" || condition.op === "/"){
                accept('error', `Type number is not correct.`, {node: whileLoopStatement, property: 'condition'});
            }
        }
        if(isVariableReference(condition)){
            if (condition.variable.ref?.type !== "bool") {
                accept('error', `Type ${condition.variable.ref?.type} is not correct.`, {node: whileLoopStatement, property: 'condition'});
            }
        }
        if(isNumberLiteral(condition)){
            accept('error', `Type number is not correct.`, {node: whileLoopStatement, property: 'condition'});
        }
        if(isFunctionCallStatement(condition)){
            const ref = condition.function.ref;
            if(ref && ref.funcReturns !== "bool"){
                accept('error', `Function ${ref.name} return ${ref.funcReturns} and not bool.`, {node: ref, property: 'name'});
            }
        }
        if(isBooleanLiteral(condition)){
            if (condition.value !== true && condition.value !== false) {
                accept('error', `Type boolean is not correct.`, {node: whileLoopStatement, property: 'condition'});
            }
        }
        if(isBinExpr(condition) && condition.ne){
            if(condition.op ==="+" || condition.op === "-" || condition.op ==="*" || condition.op === "/"){
                accept('error', `Type number is not correct.`, {node: whileLoopStatement, property: 'condition'});
            }
            if(isNumberLiteral(condition.ne)){
                accept('error', `Type number is not correct.`, {node: whileLoopStatement, property: 'condition'});
            }
        }
    }

    checkisBooleanExpression4(ifStatement: InterfaceAST.IfStatement, accept: ValidationAcceptor){
        (<any> ifStatement).accept = (visitor: RoboMLVisitor) => {return visitor.visitIfStatementImpl(ifStatement as unknown as ClassAST.IfStatementImpl);}
        const condition = ifStatement.condition
        if(isBinExpr(condition)){
            if(condition.op ==="+" || condition.op === "-" || condition.op ==="*" || condition.op === "/"){
                accept('error', `Type number is not correct.`, {node: ifStatement, property: 'condition'});
            }
        }
        if(isVariableReference(condition)){
            if (condition.variable.ref?.type !== "bool") {
                accept('error', `Type ${condition.variable.ref?.type} is not correct.`, {node: ifStatement, property: 'condition'});
            }
        }
        if(isNumberLiteral(condition)){
            accept('error', `Type number is not correct.`, {node: ifStatement, property: 'condition'});
        }
        if(isFunctionCallStatement(condition)){
            const ref = condition.function.ref;
            if(ref && ref.funcReturns !== "bool"){
                accept('error', `Function ${ref.name} return ${ref.funcReturns} and not bool.`, {node: ref, property: 'name'});
            }
        }
        if(isBooleanLiteral(condition)){
            if (condition.value !== true && condition.value !== false) {
                accept('error', `Type boolean is not correct.`, {node: ifStatement, property: 'condition'});
            }
        }
        if(isBinExpr(condition) && condition.ne){
            if(condition.op ==="+" || condition.op === "-" || condition.op ==="*" || condition.op === "/"){
                accept('error', `Type number is not correct.`, {node: ifStatement, property: 'condition'});
            }
            if(isNumberLiteral(condition.ne)){
                accept('error', `Type number is not correct.`, {node: ifStatement, property: 'condition'});
            }
        }
    }

    // verifie si le nombre de paramètres lors de l'appel à une fonction est correct
    checkNumberParamFunctionCall(functionCallStatement: InterfaceAST.FunctionCallStatement, accept: ValidationAcceptor){
        (<any> functionCallStatement).accept = (visitor: RoboMLVisitor) => {return visitor.visitFunctionCallStatementImpl(functionCallStatement as unknown as ClassAST.FunctionCallStatementImpl);}
        const ref = functionCallStatement.function.ref;
        if(ref && ref.parameters.length !== functionCallStatement.parameters.length){
            accept('error', `Function ${ref.name} has ${ref.parameters.length} parameters and not ${functionCallStatement.parameters.length}.`, {node: ref, property: 'name'});
        }
    }

    // verifie si le type des paramètres lors de l'appel à une fonction est correct
    checkTypeParamFunctionCall(functionCallStatement: InterfaceAST.FunctionCallStatement, accept: ValidationAcceptor){
        (<any> functionCallStatement).accept = (visitor: RoboMLVisitor) => {return visitor.visitFunctionCallStatementImpl(functionCallStatement as unknown as ClassAST.FunctionCallStatementImpl);}
        const ref = functionCallStatement.function.ref;
        if(ref){
            for(let i = 0; i < ref.parameters.length; i++){
                const param = ref.parameters[i]
                const paramCall = functionCallStatement.parameters[i].expression
                if(isVariableDeclaration(param) && isVariableDeclaration(paramCall)){
                    const typeParam = param.type
                    const typeParamCall = paramCall.type
                    if(typeParam !== typeParamCall){
                        accept('error', `Function ${ref.name} has ${typeParam} parameters and not ${typeParamCall}.`, {node: ref, property: 'name'});
                    }
                }
                if(isNumberLiteral(param) && isVariableDeclaration(paramCall)){
                    const typeParamCall = paramCall.type
                    if(typeParamCall !=="number"){
                        accept('error', `Function ${ref.name} has number parameters and not ${typeParamCall}.`, {node: ref, property: 'name'});
                    }
                }
                if(isBooleanLiteral(param) && isVariableDeclaration(paramCall)){
                    const typeParamCall = paramCall.type
                    if(typeParamCall !=="bool"){
                        accept('error', `Function ${ref.name} has bool parameters and not ${typeParamCall}.`, {node: ref, property: 'name'});
                    }
                }
            }
        }
    }

    checks: ValidationChecks<RobotLanguageAstType> = {
        Model: [this.checkUniqueDefs, this.checkisFunctionCall,],
        Funct:   [this.checkUniqueParams, this.checkUniqueVarInFun, this.checkVariableDeclaration, this.checkTypeFunctReturn, this.checkVoidReturn],
        VariableDeclaration: [this.checkType, this.checkTypeVariableDeclaration],
        Assignment: [this.checkTypeAssigment],
        FunctionCallStatement: [this.checkNumberParamFunctionCall, this.checkTypeParamFunctionCall, ],
        WhileLoop: [this.checkisBooleanExpression3],
        IfStatement: [this.checkisBooleanExpression4],
    };

}