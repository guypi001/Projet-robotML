import * as ASTInterfaces from './generated/ast.js';
import { Reference } from 'langium';
import { Assignment, Expression, ForLoop, Funct, FunctionCallStatement, IfStatement, InternalFunctionCallStatement, Model, Statement, VariableDeclaration, WhileLoop } from './generated/ast.js';

export interface RoboMLVisitor{
    // TODO : create one visit method for each concept of the language
    visitModelimpl(node : Modelimpl) : any;
    visitFunctImpl(node : FunctImpl) : any;
    visitFunctionParameterImpl(node : FunctionParameterImpl) : any;
    visitFunctionCallStatementImpl(node : FunctionCallStatementImpl) : any;
    visitVariableDeclarationImpl(node : VariableDeclarationImpl) : any;
    visitAssignmentImpl(node : AssignmentImpl) : any;
    visitIfStatementImpl(node : IfStatementImpl) : any;
    visitWhileLoopImpl(node : WhileLoopImpl) : any;
    visitForLoopImpl(node : ForLoopImpl) : any;
    visitRotationImpl(node : RotationImpl) : any;
    visitExpressionImpl(node : ExpressionImpl) : any;
    visitGetDistanceImpl(node : GetDistanceImpl) : any;
    visitDeplacementImpl(node : DeplacementImpl) : any;
    visitSettingImpl(node : SettingImpl) : any;
    visitGetTimeImpl(node : GetTimeImpl) : any;
    visitBasicTypeImpl(node : BasicTypeImpl) : any;
    visitUserDefinedTypeImpl(node : UserDefinedTypeImpl) : any;
    visitBinExprImpl(node : BinExprImpl) : any;
    visitBooleanLiteralImpl(node : BooleanLiteralImpl) : any;
    visitNumberLiteralImpl(node : NumberLiteralImpl) : any;
    visitVariableReferenceImpl(node : VariableReferenceImpl) : any;
}

// TODO : create one concrete class for each concept
export class Modelimpl implements ASTInterfaces.Model {
    // the constructor must take all attribute of the implemented interface 
    public readonly $type: 'Model' = 'Model';
    public functions: Array<FunctImpl> = [];

    constructor(functions: Array<FunctImpl>) {
        this.functions = functions;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitModelimpl(this);
    }
}

export class FunctImpl implements ASTInterfaces.Funct {
    public  $container: Model;
    public  $type: 'Funct' = 'Funct';
    public body: Array<Statement> = [];
    public funcReturns: 'bool' | 'number' | 'string' | 'void';
    public name: string;
    public parameters: Array<VariableDeclaration> = [];
    public returnValue?: ExpressionImpl;

    constructor(container: Model,name: string, parameters: Array<VariableDeclaration>, funcReturns: 'bool' | 'number' | 'string' | 'void', body: Array<Statement>, returnValue?: ExpressionImpl) {
        this.$container = container;
        this.name = name;
        this.parameters = parameters;
        this.funcReturns = funcReturns;
        this.body = body;
        this.returnValue = returnValue;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitFunctImpl(this);
    }
}

export class FunctionParameterImpl implements ASTInterfaces.FunctionParameter {
    public readonly $container: FunctionCallStatement;
    public readonly $type: 'FunctionParameter';
    public expression: Expression | VariableDeclaration;

    constructor(
        container:  FunctionCallStatement,
        type: 'FunctionParameter',
        expression: Expression| VariableDeclaration
    ) {
        this.$container = container;
        this.$type = type;
        this.expression = expression;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitFunctionParameterImpl(this);
    }
}

export class FunctionCallStatementImpl implements ASTInterfaces.FunctionCallStatement {
    public readonly $container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop;
    public readonly $type: 'FunctionCallStatement' = 'FunctionCallStatement';
    public function: Reference<Funct>;
    public parameters: Array<FunctionParameterImpl> = [];

    constructor(
        container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop,
        functionRef: Reference<Funct>,
        parameters: Array<FunctionParameterImpl>
    ) {
        this.$container = container;
        this.function = functionRef;
        this.parameters = parameters;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitFunctionCallStatementImpl(this);
    }
}

export class VariableDeclarationImpl implements ASTInterfaces.VariableDeclaration {
    public readonly $container: ForLoop | Funct | IfStatement | WhileLoop;
    public readonly $type: 'VariableDeclaration' = 'VariableDeclaration';
    public initialValue?: ExpressionImpl | FunctionCallStatementImpl | InternalFunctionCallStatement;
    public name: string;
    public type: 'bool' | 'number';

    constructor(
        container: ForLoop | Funct | IfStatement | WhileLoop,
        name: string,
        type: 'bool' | 'number',
        initialValue?: ExpressionImpl | FunctionCallStatementImpl | InternalFunctionCallStatement
    ) {
        this.$container = container;
        this.name = name;
        this.type = type;
        this.initialValue = initialValue;
    }
    
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitVariableDeclarationImpl(this);
    }
}

export class AssignmentImpl implements ASTInterfaces.Assignment {
    public readonly $container: ForLoop | Funct | IfStatement | WhileLoop;
    public readonly $type: 'Assignment' = 'Assignment';
    public expression: Expression;
    public variable: Reference<VariableDeclaration>;

    constructor(
        container: ForLoop | Funct | IfStatement | WhileLoop,
        variable: Reference<VariableDeclaration>,
        expression: Expression
    ) {
        this.$container = container;
        this.variable = variable;
        this.expression = expression;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitAssignmentImpl(this);
    }
}

export class IfStatementImpl implements ASTInterfaces.IfStatement {
    public readonly $container: ForLoop | Funct | IfStatement | WhileLoop;
    public readonly $type: 'IfStatement' = 'IfStatement';
    public condition: Expression | FunctionCallStatement;
    public elsebody: Array<Statement> = [];
    public ifbody: Array<Statement> = [];

    constructor(
        container: ForLoop | Funct | IfStatement | WhileLoop,
        condition: Expression | FunctionCallStatement,
        ifbody: Array<Statement>,
        elsebody: Array<Statement>
    ) {
        this.$container = container;
        this.condition = condition;
        this.ifbody = ifbody;
        this.elsebody = elsebody;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitIfStatementImpl(this);
    }
}

export class WhileLoopImpl implements ASTInterfaces.WhileLoop {
    public readonly $container: ForLoop | Funct | IfStatement | WhileLoop;
    public readonly $type: 'WhileLoop' = 'WhileLoop';
    public condition: Expression | FunctionCallStatement;
    public body: Array<Statement> = [];

    constructor(
        container: ForLoop | Funct | IfStatement | WhileLoop,
        condition: Expression | FunctionCallStatement,
        body: Array<Statement>
    ) {
        this.$container = container;
        this.condition = condition;
        this.body = body;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitWhileLoopImpl(this);
    }
}

export class ForLoopImpl implements ASTInterfaces.ForLoop {
    public readonly $container: ForLoop | Funct | IfStatement | WhileLoop;
    public readonly $type: 'ForLoop' = 'ForLoop';
    public body: Array<Statement> = [];
    public condition?: Expression | FunctionCallStatement;
    public initStatements: Array<Statement> = [];
    public updateStatements: Array<Statement> = [];

    constructor(
        container: ForLoop | Funct | IfStatement | WhileLoop,
        initStatements: Array<Statement>,
        updateStatements: Array<Statement>,
        condition?: Expression | FunctionCallStatement,
    ) {
        this.$container = container;
        this.initStatements = initStatements;
        this.condition = condition;
        this.updateStatements = updateStatements;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitForLoopImpl(this);
    }
}

export class RotationImpl implements ASTInterfaces.Rotation {
    public readonly $container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop;
    public readonly $type: 'Rotation' = 'Rotation';
    public angle: Expression;
    public function: 'Clock' = 'Clock';

    constructor(
        container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop,
        angle: Expression
    ) {
        this.$container = container;
        this.angle = angle;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitRotationImpl(this);
    }
}

export class ExpressionImpl implements ASTInterfaces.Expression {
    public readonly $type: 'Expression' = 'Expression';
    public ge?: Expression;
    public ne?: Expression;

    constructor(ge?: Expression, ne?: Expression) {
        this.ge = ge;
        this.ne = ne;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitExpressionImpl(this);
    }
}

export class GetDistanceImpl implements ASTInterfaces.GetDistance{
    public readonly $container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop;
    public readonly $type: 'GetDistance' = 'GetDistance';
    public function: 'getDistance' = 'getDistance';
    public unit2?: 'cm' | 'mm';

    constructor(
        container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop,
        unit2?: 'cm' | 'mm'
    ) {
        this.$container = container;
        this.unit2 = unit2;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitGetDistanceImpl(this);
    }
}

export class DeplacementImpl implements ASTInterfaces.Deplacement{
    public readonly $container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop;
    public readonly $type: 'Deplacement' = 'Deplacement';
    public distance: Expression;
    public function: 'Backward' | 'Forward';
    public unit?: 'cm' | 'mm';
    public unit2?: 'cm' | 'mm';

    constructor(
        container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop,
        distance: Expression,
        func: 'Backward' | 'Forward',
        unit?: 'cm' | 'mm',
        unit2?: 'cm' | 'mm'
    ) {
        this.$container = container;
        this.distance = distance;
        this.function = func;
        this.unit = unit;
        this.unit2 = unit2;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitDeplacementImpl(this);
    }
}

export class SettingImpl implements ASTInterfaces.Setting{
    public readonly $container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop;
    public readonly $type: 'Setting' = 'Setting';
    public function: 'setSpeed' = 'setSpeed';
    public unit: 'cm' | 'mm';
    public vitesse: Expression;

    constructor(
        container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop,
        unit: 'cm' | 'mm',
        vitesse: Expression
    ) {
        this.$container = container;
        this.unit = unit;
        this.vitesse = vitesse;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitSettingImpl(this);
    }
}

export class GetTimeImpl implements ASTInterfaces.GetTime{
    public readonly $container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop;
    public readonly $type: 'GetTime' = 'GetTime';
    public function: 'getTimestamp' = 'getTimestamp';

    constructor(
        container: Assignment | ForLoop | Funct | IfStatement | VariableDeclaration | WhileLoop
    ) {
        this.$container = container;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitGetTimeImpl(this);
    }
}

export class BasicTypeImpl implements ASTInterfaces.BasicType{
    public readonly $type: 'BasicType' = 'BasicType';
    public type: 'bool' | 'number' | 'string' | 'void';

    constructor(type: 'bool' | 'number' | 'string' | 'void') {
        this.type = type;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitBasicTypeImpl(this);
    }
}

export class UserDefinedTypeImpl implements ASTInterfaces.UserDefinedType{
    public readonly $type: 'UserDefinedType' = 'UserDefinedType';
    public name: string;

    constructor(name: string) {
        this.name = name;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitUserDefinedTypeImpl(this);
    }
}

export class BinExprImpl implements ASTInterfaces.BinExpr{
    public readonly $type: 'BinExpr' = 'BinExpr';
    public e1: Expression;
    public e2: Expression;
    public op: '!=' | '&&' | '*' | '+' | '-' | '/' | '<' | '<=' | '==' | '>' | '>=' | '||';

    constructor(e1: Expression, e2: Expression, op: '!=' | '&&' | '*' | '+' | '-' | '/' | '<' | '<=' | '==' | '>' | '>=' | '||') {
        this.e1 = e1;
        this.e2 = e2;
        this.op = op;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitBinExprImpl(this);
    }
}

export class BooleanLiteralImpl implements ASTInterfaces.BooleanLiteral{
    public readonly $type: 'BooleanLiteral' = 'BooleanLiteral';
    public value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitBooleanLiteralImpl(this);
    }
}

export class NumberLiteralImpl implements ASTInterfaces.NumberLiteral{
    public readonly $type: 'NumberLiteral' = 'NumberLiteral';
    public value: number;

    constructor(value: number) {
        this.value = value;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitNumberLiteralImpl(this);
    }
}

export class VariableReferenceImpl implements ASTInterfaces.VariableReference{
    public readonly $type: 'VariableReference' = 'VariableReference';
    public variable: Reference<VariableDeclaration>;

    constructor(variable: Reference<VariableDeclaration>) {
        this.variable = variable;
    }
    accept (visitor: RoboMLVisitor) : any {
        return visitor.visitVariableReferenceImpl(this);
    }
}

// realiser un