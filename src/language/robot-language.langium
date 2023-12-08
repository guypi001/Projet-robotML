grammar RobotLanguage

// Règle de production pour le programme
entry Model:
    (functions+=Funct )*;

// Règle de production pour une fonction sachant qu'on peut avoir des retours
Funct:
    "let" funcReturns=("void"|"number"|"bool"|"string") name=ID "(" (parameters+=VariableDeclaration (',' parameters+= VariableDeclaration)*)? ")" '{' body+=Statement*  ("return" returnValue=Expression)? "}";

//fragment Block: '{' body+=Statement* '}';

// Règle de production pour une déclaration de variable
VariableDeclaration:
    ("var")? type=('number' | 'bool') name=ID ("=" initialValue=(Expression | FunctionCallStatement | InternalFunctionCallStatement))?;

// Règle de production pour une instruction
Statement:
    VariableDeclaration | Assignment | ControlStatement | FunctionCallStatement;

// Règle de production pour une instruction d'affectation
Assignment:
    variable=[VariableDeclaration] "=" (expression=(Expression | FunctionCallStatement | InternalFunctionCallStatement)) ("in" unit2=("mm"|"cm"))?;
    //variableDeclaration=[VariableDeclaration] "=" value=Expression;

// Règle de production pour une instruction de contrôle
ControlStatement:
    IfStatement | LoopStatement | InternalFunctionCallStatement;

FunctionCallStatement:
// Nom de la fonction à appeler
    function=[Funct]
// Liste des paramètres
    "(" (parameters+=FunctionParameter (',' parameters+=FunctionParameter)*)? ")";

// Règle de production pour une instruction if
IfStatement:
    "if" "(" condition=(Expression | FunctionCallStatement) ")" '{' ifbody+=Statement* '}' ("else" '{' elsebody+=Statement* '}')?;

// Règle de production pour une instruction de boucle
LoopStatement:
    WhileLoop | ForLoop;

// Règle de production pour une boucle while
WhileLoop:
    "loop" condition=(Expression | FunctionCallStatement) '{' body+=Statement* '}';

// Règle de production pour une boucle for
ForLoop:
    "for" "(" (initStatements+=Statement)? ";" (condition=(Expression | FunctionCallStatement))? ";" (updateStatements+=Statement)? ")" '{' body+=Statement* '}';

// Règle de production pour une instruction d'appel de fonction interne
InternalFunctionCallStatement:
    InternalFunctionCall ;

// Règle de production pour un appel de fonction interne
InternalFunctionCall:
    Deplacement | Rotation | Setting | GetTime | GetDistance;

Deplacement:
    function=("Forward"|"Backward") distance=Expression (unit=("mm"|"cm") | "in" unit2=("mm"|"cm"))?;

Rotation:
    function="Clock" angle=Expression;

Setting:
    function="setSpeed" "(" vitesse=Expression (unit=("mm"|"cm"))? ")";

GetTime:
    function="getTimestamp" "(" ")";

GetDistance:
    function="getDistance" "(" ")" ("in" unit2=("mm"|"cm"))?;

// Règle de production pour un paramètre de fonction
FunctionParameter:
    expression = (VariableDeclaration | Expression);

Expression:
    AdditionExpression | OrExpression;

AdditionExpression infers Expression:
    MultiplicationExpression ({infer BinExpr.e1=current} op=('+'|'-') e2=MultiplicationExpression)*;

MultiplicationExpression infers Expression:
    PrimaryExpression ({infer BinExpr.e1=current} op=('*'|'/') e2=PrimaryExpression)*;
PrimaryExpression infers Expression:
    Literal | VariableReference | GroupedExpression | NegatedExpression;
GroupedExpression infers Expression:
    '(' ge=Expression ')';
NegatedExpression infers Expression:
    '-' ne=Expression;
Literal infers Expression:
    NumberLiteral | BooleanLiteral ;

OrExpression infers Expression:
    AndExpression ({infer BinExpr.e1=current} op='||' e2=AndExpression)*;
AndExpression infers Expression:
    EqualityExpression ({infer BinExpr.e1=current} op='&&' e2=EqualityExpression)*;
EqualityExpression infers Expression:
    ComparisonExpression ({infer BinExpr.e1=current} op=('=='|'!=') e2=ComparisonExpression)*;
ComparisonExpression infers Expression:
    AdditionExpression ({infer BinExpr.e1=current} op=('<'|'<='|'>'|'>=') e2=AdditionExpression)*;


//MesureExpression:
    //value=INT unit=("cm"|"mm");


// Règle de production pour un littéral numérique
NumberLiteral:
    value=NUMBER;

BooleanLiteral:
    value=BOOL;

// Règle de production pour une référence de variable
VariableReference:
    variable=[VariableDeclaration];

// Règle de production pour un type de variable
VariableType:
    BasicType | UserDefinedType;

// Règle de production pour un type de base
BasicType: 
    type=("void"|"number"|"bool"|"string");

// Règle de production pour un type défini par l'utilisateur
UserDefinedType:
    name=ID;

// Règle de production pour un littéral booléen
terminal BOOL returns boolean:
    "true" | "false";

hidden terminal WS:
     /\s+/;
terminal ID:
     /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number:
     /(?:(?:-?[0-9]+)?\.[0-9]+)|-?[0-9]+/;
//terminal STRING:
  //   /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT:
     /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT:
     /\/\/[^\n\r]*/;