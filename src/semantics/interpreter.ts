import { Assignment, BasicType, BinExpr, BooleanLiteral, Deplacement, ForLoop, Funct, FunctionCallStatement, FunctionParameter, GetDistance, GetTime, IfStatement, Model, NumberLiteral, Rotation, Setting, UserDefinedType, VariableDeclaration, VariableReference, WhileLoop, isAssignment, isBinExpr, isBooleanLiteral, isDeplacement, isExpression, isFunctionCallStatement, isGetDistance, isGetTime, isIfStatement, isInternalFunctionCall, isInternalFunctionCallStatement, isNumberLiteral, isRotation, isSetting, isVariableDeclaration, isVariableReference, isWhileLoop } from '../language/generated/ast.js';
import {  BooleanLiteralImpl, ExpressionImpl, NumberLiteralImpl, RoboMLVisitor } from '../language/visitor.js';
import { Expression } from '../language/generated/ast.js';

export class MyRoboMLVisitor implements RoboMLVisitor {

    // initialiser une liste de json
    jsonlist: any[] = []; 
visitFunctImpl(node: Funct) {
        // Visit function parameters
        /*
        for (const param of node.parameters) {
            //param.accept(this);
            this.visitVariableDeclarationImpl(param);
        }*/

        // Visit function statements

        for (const stmt of node.body) {

            if (isAssignment(stmt)) {
                if (stmt.variable.ref) {
                    console.log(`Assigment ${stmt.variable.ref.name} = ${this.visitAssignmentImpl(stmt)}`);
                }
            }
            if (isFunctionCallStatement(stmt)) {
                this.visitFunctionCallStatementImpl(stmt);
            }
            if (isVariableDeclaration(stmt) && isExpression(stmt.initialValue)) {
                console.log(`Variable ${stmt.name} = ${this.visitExpressionImpl(stmt.initialValue)}`);
            }
            if (isIfStatement(stmt)) {
                this.visitIfStatementImpl(stmt);
            }
            if(isWhileLoop(stmt)) {
                this.visitWhileLoopImpl(stmt);
            }
            if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt)) {
                if (isGetDistance(stmt)) {
                    this.visitGetDistanceImpl(stmt);
                }
                if (isGetTime(stmt)) {
                    this.visitGetTimeImpl(stmt);
                }
                if (isDeplacement(stmt)) {
                    if(stmt.function === 'Forward') {
                        this.visitDeplacementImpl(stmt);
                    }
                    if(stmt.function === 'Backward') {
                        this.visitDeplacementImpl(stmt);
                    }
                }
                if (isRotation(stmt)) {
                    this.visitRotationImpl(stmt);
                }
                if (isSetting(stmt)) {
                    this.visitSettingImpl(stmt);
                }
            }
        }
        // Visit return value expression (if applicable)
        if (node.returnValue) {
            //node.returnValue.accept(this);
            return this.visitExpressionImpl(node.returnValue);
        }

        return null;
    }
    visitFunctionParameterImpl(node: FunctionParameter) {
        //node.expression.accept(this);
        if (isExpression(node.expression)) {
            return this.visitExpressionImpl(node.expression);
        }
        if (isVariableDeclaration(node.expression)) {
            return this.visitVariableDeclarationImpl(node.expression);
        }
        return null;
    }
    visitFunctionCallStatementImpl(node: FunctionCallStatement) {
        // Visit the function parameters
        for (let i = 0; i < node.parameters.length; i++) {
            const param = node.parameters[i].expression;
            if (isExpression(param)) {
                if (node.function.ref ) {
                    node.function.ref.parameters[i].initialValue = param
                }
            }
        }
        // Visit the function reference if it exists
        this.visitFunctImpl(node.function.ref as Funct);

        return null;
    }
    visitVariableDeclarationImpl(node: VariableDeclaration) {
        let value: any = null;
        if (node.initialValue) {
            if (isExpression(node.initialValue)) {
                //node.initialValue.accept(this);
                value = this.visitExpressionImpl(node.initialValue);
            }
            if (isFunctionCallStatement(node.initialValue)) {
                //node.initialValue.accept(this);
                value = this.visitFunctionCallStatementImpl(node.initialValue);
            }
            if (isInternalFunctionCallStatement(node.initialValue) && isInternalFunctionCall(node.initialValue) && isGetDistance(node.initialValue)) {
                //node.initialValue.accept(this);
                value = this.visitGetDistanceImpl(node.initialValue);
            }
            if (isInternalFunctionCallStatement(node.initialValue) && isInternalFunctionCall(node.initialValue) && isGetTime(node.initialValue)) {
                //node.initialValue.accept(this);
                value = this.visitGetTimeImpl(node.initialValue);
            }

        }
        node.initialValue = value;

        return value;
    }
    visitAssignmentImpl(node: Assignment) {
        // Retrieve the variable declaration referenced by the `variable` property
        let value: any = null;
        //const variableDeclaration = node.variable.ref;
        if(isVariableDeclaration(node.variable.ref) ){
            
            if(isExpression(node.expression)) {
                //node.variable.ref.initialValue = node.expression;
                value = this.visitExpressionImpl(node.expression);
                //verifie si value est int
                if(node.variable.ref.type === 'number') {
                        let asss = new NumberLiteralImpl(value);
                        node.variable.ref.initialValue = asss;
                    
                }
                //verifie si value est bool
                if(node.variable.ref.type === 'bool') {
                    let asss = new BooleanLiteralImpl(value);
                    node.variable.ref.initialValue = asss;
                }
                
            }
            if(isFunctionCallStatement(node.expression)) {
                //node.variable.ref.initialValue = node.expression;
                value = this.visitFunctionCallStatementImpl(node.expression);
                if(node.variable.ref.type === 'number') {
                    let asss = new NumberLiteralImpl(value);
                    node.variable.ref.initialValue = asss;
                }
            }
            if(isInternalFunctionCallStatement(node.expression) && isInternalFunctionCall(node.expression) && isGetDistance(node.expression)) {
                //node.variable.ref.initialValue = node.expression;
                value = this.visitGetDistanceImpl(node.expression);
                if(node.variable.ref.type === 'number') {
                    let asss = new NumberLiteralImpl(value);
                    node.variable.ref.initialValue = asss;
                }
            }
            if(isInternalFunctionCallStatement(node.expression) && isInternalFunctionCall(node.expression) && isGetTime(node.expression)) {
                //node.variable.ref.initialValue = node.expression;
                value = this.visitGetTimeImpl(node.expression);
                if(node.variable.ref.type === 'number') {
                    let asss = new NumberLiteralImpl(value);
                    node.variable.ref.initialValue = asss;
                }
            }
        }
        
        return value;
    }

    visitDeplacementImpl(node: Deplacement) {
        // rajouter un json dans la liste jsonlist
        this.jsonlist.push({function: node.function, distance: this.visitExpressionImpl(node.distance)});
        console.log(`Deplacement ${node.function}(${this.visitExpressionImpl(node.distance)})`);
    }
    visitIfStatementImpl(node: IfStatement) {
        if(isExpression(node.condition)){
        if(this.visitExpressionImpl(node.condition)) {
            // Visit the statements in the 'if' block
            for (const stmt of node.ifbody) {
                if (isAssignment(stmt)) {

                    this.visitAssignmentImpl(stmt);
                }
                if (isFunctionCallStatement(stmt)) {
                    this.visitFunctionCallStatementImpl(stmt);  
                }
                if (isVariableDeclaration(stmt)) {

                    this.visitVariableDeclarationImpl(stmt);
                }
                if(isIfStatement(stmt)) {
                    this.visitIfStatementImpl(stmt);
                }
                if(isWhileLoop(stmt)) {
                    this.visitWhileLoopImpl(stmt);
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isGetDistance(stmt)) {
                    this.visitGetDistanceImpl(stmt);
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isGetTime(stmt)) {
                    this.visitGetTimeImpl(stmt);
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isDeplacement(stmt)) {
                    this.visitDeplacementImpl(stmt);
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isRotation(stmt)) {
                    this.visitRotationImpl(stmt);
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isSetting(stmt)) {
                    this.visitSettingImpl(stmt);
                }
            }
        }else {
            // Visit the statements in the 'else' block (if present)
            if (node.elsebody.length > 0) {
                for (const stmt of node.elsebody) {
                    if (isAssignment(stmt)) {
                        this.visitAssignmentImpl(stmt);
                    }
                    if (isFunctionCallStatement(stmt)) {
                        this.visitFunctionCallStatementImpl(stmt);
                    }
                    if (isVariableDeclaration(stmt)) {
                        this.visitVariableDeclarationImpl(stmt);
                    }
                    if(isIfStatement(stmt)) {
                        this.visitIfStatementImpl(stmt);
                    }
                    if(isWhileLoop(stmt)) {
                        this.visitWhileLoopImpl(stmt);
                    }
                    if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isGetDistance(stmt)) {
                        this.visitGetDistanceImpl(stmt);
                    }
                    if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isGetTime(stmt)) {
                        this.visitGetTimeImpl(stmt);
                    }
                    if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isDeplacement(stmt)) {
                        this.visitDeplacementImpl(stmt);
                    }
                    if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isRotation(stmt)) {
                        this.visitRotationImpl(stmt);
                    }
                    if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isSetting(stmt)) {
                        this.visitSettingImpl(stmt);
                    }
                }
            }
        }
    }

        return null;
    }
    visitWhileLoopImpl(node: WhileLoop) {
        if(isExpression(node.condition)){
        while (this.visitExpressionImpl(node.condition)) {
            // Visit the statements in the loop body
            for (const stmt of node.body) {
                if (isAssignment(stmt)) {
                    if (stmt.variable.ref) {
                        console.log(`Assigment ${stmt.variable.ref.name} = ${this.visitAssignmentImpl(stmt)}`);
                    }
                }
                if (isFunctionCallStatement(stmt)) {
                    this.visitFunctionCallStatementImpl(stmt);
                }
                if (isVariableDeclaration(stmt)) {
                    if (isVariableDeclaration(stmt)) {
                        if (isExpression(stmt.initialValue)) {
                            //this.visitExpressionImpl(stmt.initialValue);
                            console.log(`Variable ${stmt.name} = ${this.visitExpressionImpl(stmt.initialValue)}`);
                        }
                        if (isFunctionCallStatement(stmt.initialValue)) {
                            console.log(`Variable ${stmt.name} = ${this.visitFunctionCallStatementImpl(stmt.initialValue)}`);
                        }
                        if (isInternalFunctionCallStatement(stmt.initialValue) && isInternalFunctionCall(stmt.initialValue) && isGetDistance(stmt.initialValue)) {
                            console.log(`Variable ${stmt.name} = ${this.visitGetDistanceImpl(stmt.initialValue)}`);
                        }
                        if (isInternalFunctionCallStatement(stmt.initialValue) && isInternalFunctionCall(stmt.initialValue) && isGetTime(stmt.initialValue)) {
                            console.log(`Variable ${stmt.name} = ${this.visitGetTimeImpl(stmt.initialValue)}`);
                        }
                    }
                }
                if(isIfStatement(stmt)) {
                    this.visitIfStatementImpl(stmt);
                }
                if(isWhileLoop(stmt)) {
                    this.visitWhileLoopImpl(stmt);
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isGetDistance(stmt)) {
                    this.visitGetDistanceImpl(stmt);
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isGetTime(stmt)) {
                    this.visitGetTimeImpl(stmt);
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isDeplacement(stmt)) {
                    if(stmt.function === 'Forward') {
                        this.visitDeplacementImpl(stmt);
                    }
                    if(stmt.function === 'Backward') {
                        this.visitDeplacementImpl(stmt);
                    }
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isRotation(stmt)) {
                    this.visitRotationImpl(stmt);
                }
                if(isInternalFunctionCallStatement(stmt) && isInternalFunctionCall(stmt) && isSetting(stmt)) {
                    this.visitSettingImpl(stmt);
                }
            }
        }
    }

        return null;
    }
    visitForLoopImpl(node: ForLoop) {
        throw new Error('Method not implemented.');
    }
    visitRotationImpl(node: Rotation) {
        // rajouter un json dans la liste jsonlist
        this.jsonlist.push({function: node.function, distance: this.visitExpressionImpl(node.angle)});
        console.log(`Rotation ${node.function}(${this.visitExpressionImpl(node.angle)})`);
    }
    visitExpressionImpl(node: Expression): any {
        // Handle the `ge` expression (if present)
        if (node.ge) {
            return this.visitExpressionImpl(node.ge);
        }

        // Handle the `ne` expression (if present)
        if (node.ne) {
            return -1 * this.visitExpressionImpl(node.ne);
        }

        if (isBinExpr(node)) {
            return this.visitBinExprImpl(node);
        }
        if (isBooleanLiteral(node)) {
            return this.visitBooleanLiteralImpl(node);
        }
        if (isNumberLiteral(node)) {
            return this.visitNumberLiteralImpl(node);
        }
        if(isVariableReference(node)) {
            return this.visitVariableReferenceImpl(node);
        }

        return 'bim';
    }
    visitGetDistanceImpl(node: GetDistance) {
        // rajouter un json dans la liste jsonlist
        this.jsonlist.push({function: node.function});
        return 1000;
    }
    DeplacementImpl(node: Deplacement) {
        // Visit the distance expression
        this.visitExpressionImpl(node.distance as ExpressionImpl);
        

        // Handle the unit and unit2 properties (if present)
        if (node.unit) {
            // Handle the unit value (e.g., type checking, unit conversion)
        }
        if (node.unit2) {
            // Handle the unit2 value (e.g., type checking, unit conversion)
        }

        return null;
    }
    visitSettingImpl(node: Setting) {
        // rajouter un json dans la liste jsonlist
        this.jsonlist.push({function: node.function});
        // Handle the unit property
        if (node.unit) {
            // Perform type checking or unit conversion for the unit value
        }
        // Visit the vitesse expression
        this.visitExpressionImpl(node.vitesse as ExpressionImpl);

        return null;
    }
    visitGetTimeImpl(node: GetTime) {
        // rajouter un json dans la liste jsonlist
        this.jsonlist.push({function: node.function});
        return 1000
    }
    visitBasicTypeImpl(node: BasicType) {
        throw new Error('Method not implemented.');
    }
    visitUserDefinedTypeImpl(node: UserDefinedType) {
        throw new Error('Method not implemented.');
    }
    visitBinExprImpl(node: BinExpr) {
        let left: any = node.e1;
        let right: any = node.e2;

        if (isBinExpr(left)) {
            left = this.visitBinExprImpl(left);
        }
        if (isBinExpr(right)) {
            right = this.visitBinExprImpl(right);
        }
        if(isNumberLiteral(left)) {
            left = this.visitNumberLiteralImpl(left);
        }
        if(isNumberLiteral(right)) {
            right = this.visitNumberLiteralImpl(right);
        }
        if(isVariableReference(left)) {
            left = this.visitVariableReferenceImpl(left);
        }
        if(isVariableReference(right)) {
            right = this.visitVariableReferenceImpl(right);
        }
        if(isBooleanLiteral(left)) {
            left = this.visitBooleanLiteralImpl(left);
        }
        if(isBooleanLiteral(right)) {
            right = this.visitBooleanLiteralImpl(right);
        }

        // Handle the binary operator (op) based on its type
        switch (node.op) {
            case '!=':
            // Handle the '!=' operator
                return left !== right;
            case '&&':
            // Handle the '&&' operator
                return left && right;
            case '*':
                // Handle the '*' operator
                return Number(left) * Number(right);
            case '+':
            // Handle the '+' operator
                return Number(left) + Number(right);
            case '-':
            // Handle the '-' operator
                return Number(left) - Number(right);
            case '/':
            // Handle the '/' operator
                return Number(left) / Number(right);
            case '<':
            // Handle the '<' operator
                return left < right;
            case '<=':
            // Handle the '<=' operator
                return left <= right;
            case '==':
            // Handle the '==' operator
                return left === right;
            case '>':
            // Handle the '>' operator
                return left > right;
            case '>=':
            // Handle the '>=' operator
                return left >= right;
            case '||':
            // Handle the '||' operator
                return left || right;
            default:
            // Handle any other unsupported binary operators
        }
        return null;
    }
    visitBooleanLiteralImpl(node: BooleanLiteral) {
          return node.value;
    }
    visitNumberLiteralImpl(node: NumberLiteral) {
        return node.value;
    }
    visitVariableReferenceImpl(node: VariableReference): any {
        const variableDeclaration = node.variable.ref;
        if(isVariableDeclaration(variableDeclaration) ){
            if (isExpression(variableDeclaration.initialValue)) {
                // Check the variable's type
                if (variableDeclaration.type === 'bool') {
                    if (isBooleanLiteral(variableDeclaration.initialValue)) {
                        return this.visitBooleanLiteralImpl(variableDeclaration.initialValue);
                    }
                } else if (variableDeclaration.type === 'number') {
                    if (isNumberLiteral(variableDeclaration.initialValue)) {
                        return this.visitNumberLiteralImpl(variableDeclaration.initialValue);
                    }
                }
                if(isExpression(variableDeclaration.initialValue)) {
                    return this.visitExpressionImpl(variableDeclaration.initialValue as ExpressionImpl);
                }
            }
            if (isFunctionCallStatement(variableDeclaration.initialValue)) {
                return this.visitFunctionCallStatementImpl(variableDeclaration.initialValue);
            }
            if (isInternalFunctionCallStatement(variableDeclaration.initialValue) && isInternalFunctionCall(variableDeclaration.initialValue) && isGetDistance(variableDeclaration.initialValue)) {
                return this.visitGetDistanceImpl(variableDeclaration.initialValue);
            }
            if (isInternalFunctionCallStatement(variableDeclaration.initialValue) && isInternalFunctionCall(variableDeclaration.initialValue) && isGetTime(variableDeclaration.initialValue)) {
                return this.visitGetTimeImpl(variableDeclaration.initialValue);
            }
            if (isVariableReference(variableDeclaration.initialValue)) {
                return this.visitVariableReferenceImpl(variableDeclaration.initialValue);
            }
        }
        return variableDeclaration;
    }
    public visitModelimpl(node: Model): any {
        node.functions.forEach(funct => {
            if(funct.name === 'entry') {
                console.log('entry');
            this.visitFunctImpl(funct as Funct);
            }
        })
        console.log(this.jsonlist);
        //return this.jsonlist;
        return null;
    }
}