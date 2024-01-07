# TP ASE : RoboML - Création d'un langage de manipulation de Robot

Bienvenue dans ce repo GitHub RoboML. Ce projet est issu de sessions de TP visant à créer un langage dédié (DSL) permettant de spécifier le comportement d’un petit robot. Il contient l'ensemble des étapes de la conception à l'implémentation complètes de l'écosystème RoboML. Il couvre la modélisation du domaine, l'éditeur de texte avec ses services(validateurs), un interpréteur auquel l'on a associé un simulateur web, et enfin, un compilateur générant du code Arduino pour exécuter le comportement sur le robot réel.

## Partie 1 - Modélisation du domaine : Définition du métamodèle du langage avec Ecore

Dans cette première partie nous nous interesserons aux concepts indispensables à la création de notre métamodèle ainsi que les relations que ces derniers entretiennent entre eux.

### Description des concepts 
Nous avons pris le soin de nommer les concepts de manière à ce qu'ils soient compréhensible au maximum. Cependant, nous allons décrire les concepts fondamentaux qui composent notre métamodel.


**Program :** Le programme englobe l'ensemble des instructions et des structures nécessaires pour définir le comportement global du robot. Il agit comme le point d'entrée du DSL.

    Il englobe la notion de Function 

**Function :** Représente un ensemble d'instructions regroupées sous un nom spécifique. Elle peut être appelée et exécutée à partir d'autres parties du programme, fournissant une modularité et une réutilisabilité du code.
      
      - EntryPointFunction
      - UserDefinedFunction
    
**Statement :** Une instruction représente une action exécutable dans le programme. Cela peut inclure des affectations, des boucles, des conditions, etc.

**Expression :** Une expression représente une combinaison de variables, opérateurs et littéraux qui évalue une valeur. Les expressions sont souvent utilisées pour définir des conditions ou des calculs.

**Operator :** Un opérateur effectue une opération sur une ou plusieurs expressions. Les opérateurs peuvent être arithmétiques, logiques, relationnels, etc.

**Declaration :** Une déclaration introduit une variable, une fonction ou d'autres entités dans le programme. Elle spécifie le nom et le type de l'entité, la rendant utilisable dans le reste du code.

**Variable :** Elle représente la notion de variable. Elle peut être local, global, un paramètre de fonction ou de boucle.

**Robot :** Represente l'ensemble des concepts propre au robot. Il regroupe les mouvements, les capteurs, la vitesse, ...

**Type :** spécifie la nature des données qu'une variable peut contenir. Il définit les caractéristiques et le comportement associés à ces données. Les types peuvent inclure des entiers, des chaînes de caractères, des booléens, etc.

**Literal :** Un littéral représente une valeur fixe écrite directement dans le code source. Par example, les nombres, les chaînes de caractères ou les booléens peuvent être des littéraux.
    
**Unit :** Utilisé pour définir des unités de mesure dans le contexte du robot.
    

### Présentation du Modèle Ecore
L'image fournit (loin d'être visible) dénote du grand nombre de concept que nous avons du définir pour notre modèle Ecore.

![WhatsApp Image 2023-11-21 at 20 32 14](https://github.com/guypi001/Projet-robotML/assets/107374001/f121da50-3bd4-4e28-954b-d77f6bfa6ff3)

**NB:** La modélisation de notre modèle Ecore nous a permis de connaitre les concepts qui entrent en jeu ainsi que les rélations que ces derniers entretiennent entre eux. Cependant, pour la suite, nous avons optés d'écrire nous même notre grammaire avec Langium plutôt que de générer une grammaire Xtext.


## Partie 2 - Modélisation textuelle: Définition de la grammaire Langium et de l'éditeur de notre language

Dans cette seconde phase de notre projet, nous abordons la modélisation textuelle à travers la création et la définition de la grammaire Langium, ainsi que le développement d'un éditeur dédié à notre langage. Cette étape est essentielle car elle établit les fondations linguistiques et les outils nécessaires pour la manipulation efficace de notre langage spécifique.

**Présentation de la grammaire Langium:**

Comme expliqué précédemment, nous avons opté pour la création de notre propre grammaire Langium.

Voilà un apperçu de cette dernière:

```
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


````
En résumé, la création manuelle de la grammaire Langium garantit non seulement un contrôle précis sur le langage, mais aussi une compréhension approfondie et une adaptabilité maximale pour répondre aux besoins actuels et futurs de notre projet. Cela forme le socle solide sur lequel reposera tout le développement ultérieur de notre langage spécifique.

Nous avons ensuite pris le soin de définir **les règles de validation de notre langage.** Ces règles permettent de vérifier la cohérence du code écrit par l'utilisateur. Par exemple, on peut vérifier que les variables utilisées dans une expression sont bien déclarées, ou que les paramètres d'une fonction sont bien utilisés dans son corps.

````
   checkUniqueDefs(model: Model, accept: ValidationAcceptor): void {
        const definedFunctions = new Set<string>();
        model.functions.forEach(f => {
            definedFunctions.add(f.name);
            this.declaredFunctions.add(f.name);
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
````

## Partie 3 - Modélisation Exécutable

Dans les étapes précédentes, on a d'abord identifié les concepts de base de notre langage, et implémenté une syntaxe textuelle pour définir les instances de ces concepts. 
À ce stade, nos programmes sont analysables, ce qui signifie que Langium est en mesure de nous fournir un arbre syntaxique abstrait (AST) représentant nos programmes. 
Dans l'étape suivante nous allons essayer d'exécuter ces instances de modèle au travers d'un **interpreteur** et d'un **compilateur**

Le design pattern visiteur nous a grandement servi pour implémenter l'interpréteur et le compilateur. En effet, ce design pattern permet de diviser la définition du langage en deux parties, la syntaxe (syntaxe abstraite définie par le métamodèle et syntaxe concrète définie par la grammaire) et la sémantique (interpréteur et compilateur), facilitant l'extension/évolution de la sémantique du langage. Chaque méthode mise en œuvre dans un visiteur représente la sémantique d'un concept, en s’appuyant souvent sur la sémantique de son enfant dans l’AST.

### Interprétation :

Dans cette partie, nous nous interesserons à l'implémentation de notre interpreteur. Il fonctionnera sur un simulateur web pour le robot écrit en JavaScript. Pour celà nous nous sommes servis de l'ébauche du code du simulateur fourni pour cette partie du TP. Nous avons implémenté un visiteur qui parcourt l'AST et exécute les instructions du programme.

En résumé, le code de notre fichier interpreter.ts représente un visiteur pour un AST spécifique dans notre langage RobotML. Il parcourt l'AST et extrait des informations spécifiques, stockant ces informations dans une liste JSON pour un traitement ultérieur. 

Les fichiers TypeScript présents dans le répertoire "web/simulator" représentent les éléments de la simulation que nous utilisons dans notre interpréteur. Plus précisément, nous y localiserons la classe "Robot" qui sera manipulée par notre interprète. Quant aux fichiers JavaScript situés dans le répertoire "static/simulator", ils servent à afficher la simulation sur la page web. Ce code JavaScript anticipe la réception de l'état final de la scène simulée.

Notre simulateur comporte un certains nombre d'actions dont les principales sont **Parse and Validate** et **Execute simulation**

Voici une vidéo simulant l'action de notre interpreteur.

[simulation.webm](https://github.com/guypi001/RobotML/assets/107374001/8e88647c-ffd6-4355-b544-d14d28d7962f)

### Compilation :
La dernière section de ce TP sera consacrer à l'élaboration du compilateur.Dans la même logique que celle de l'interpreteur nous avons entrepris d'implémenter un visiteur qui parcourt l'AST et génère le code Arduino correspondant.
Chaque étape implique des règles spécifiques au DSL et aux caractéristiques de notre langage cible. L'objectif principal d'un compilateur est de traduire le code source RobotML en un format exécutable (Arduino).

![image](https://github.com/guypi001/Projet-robotML/assets/107374001/d9f1375b-b170-4b49-b0d7-06c2b7430568)

### Notes Particulières

![dialog-warning-panel](https://github.com/guypi001/Projet-robotML/assets/107374001/6c5f2bfe-ceb1-4caa-9567-a7b960731c38)

Nous avons mis l'accent sur la réalisation de l'interpreteur ainsi que le simulateur web qui l'accompagne. Pour ce qui est du compilateur, nous avons entrepris son implémentation mais il n'est pas encore opérationnel.

