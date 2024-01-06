# TP ASE : RoboML - Création d'un langage de manipulation de Robot

Bienvenue dans ce repo GitHub RoboML. Ce projet est issu de sessions de TP visant à créer un langage dédié (DSL) permettant de spécifier le comportement d’un petit robot. Il se distingue par la conception et l'implémentation complètes de l'écosystème RoboML, couvrant la modélisation du domaine, l'éditeur de texte avec ses services, un interpréteur basé sur un simulateur web, et enfin, un compilateur générant du code Arduino pour exécuter le comportement sur le robot réel.

# Sommaire

[Partie 1 - Modélisation du domaine : Définition du métamodèle du langage avec Ecore](#1---Partie-1-Modélisation-du-domaine-:-Définition-du-métamodèle-du-langage-avec-Ecore)

## Partie 1 - Modélisation du domaine : Définition du métamodèle du langage avec Ecore

Dans cette première partie nous nous interesserons aux concepts indispensables à la création de notre métamodèle ainsi que les relations que ces dernièrs entretiennent entre eux.

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

**NB:** La modélisation de notre modèle Ecore nous à permis de connaitre les concepts qui entrent en jeu ainsi que les rélations que ces derniers entretiennent entre eux. Cependant, pour la suite, nous avons optés d'écrire nous même notre grammaire plutôt que de générer une grammaire Xtext.

## Partie 2 - Modélisation textuelle: Définition de la grammaire Langium et de l'éditeur de notre language

Dans cette seconde phase de notre projet, nous abordons la modélisation textuelle à travers la création et la définition de la grammaire Langium, ainsi que le développement d'un éditeur dédié à notre langage. Cette étape est essentielle car elle établit les fondations linguistiques et les outils nécessaires pour la manipulation efficace de notre langage spécifique.

**Choix de la création de la grammaire Langium:**

Nous avons délibérément opté pour la création manuelle de la grammaire Langium plutôt que d'utiliser Xtext pour générer automatiquement la grammaire. Cette décision découle de plusieurs considérations stratégiques et conceptuelles.

- **Contrôle Précis:**
En écrivant nous-mêmes la grammaire Langium, nous avons un contrôle total sur la définition des règles syntaxiques et sémantiques de notre langage. Cela nous permet d'ajuster finement le comportement du langage en fonction de nos besoins spécifiques.

- **Compréhension Approfondie:**
La rédaction manuelle de la grammaire nécessite une compréhension approfondie des structures syntaxiques de notre langage. Ce processus renforce notre connaissance du langage que nous sommes en train de créer et facilite une meilleure anticipation des besoins futurs.

- **Adaptabilité et Évolutivité:**
En écrivant notre propre grammaire, nous créons une base flexible et évolutive. Cette approche nous permet d'ajouter des fonctionnalités, de modifier des règles, et de faire évoluer notre langage au fil du temps sans dépendre étroitement des contraintes imposées par des outils de génération automatique.

En résumé, la création manuelle de la grammaire Langium garantit non seulement un contrôle précis sur le langage, mais aussi une compréhension approfondie et une adaptabilité maximale pour répondre aux besoins actuels et futurs de notre projet. Cela forme le socle solide sur lequel reposera tout le développement ultérieur de notre langage spécifique.

Nous anons ensuite pris le soin de définir **les règles de validation de notre langage.** Ces règles permettent de vérifier la cohérence du code écrit par l'utilisateur. Par exemple, on peut vérifier que les variables utilisées dans une expression sont bien déclarées, ou que les paramètres d'une fonction sont bien utilisés dans son corps.

## Partie 3 - Modélisation Exécutable

Dans les étapes précédentes, on a d'abord identifié les concepts de base de notre langage, et implémenté une syntaxe textuelle pour définir les instances de ces concepts. À ce stade, nos programmes sont analysable, ce qui signifie que Langium est en mesure de nous fournir un arbre syntaxique abstrait (AST) représentant nos programmes. L'étape suivante consiste à essayer d'exécuter ces instances de modèle : cela peut se faire soit par interprétation, soit par compilation. 

Le design pattern visitor nous a grandement servi pour implémenter l'interpréteur et le compilateur. En effet, ce design pattern permet de diviser la définition du langage en deux parties, la syntaxe (syntaxe abstraite définie par le métamodèle et syntaxe concrète définie par la grammaire) et la sémantique (interpréteur et compilateur), facilitant l'extension/évolution de la sémantique du langage. Chaque méthode mise en œuvre dans un visiteur représente la sémantique d'un concept, en s'appuyant souvent sur la sémantique de son enfant dans l'AST.

### Interprétation :

Dans ce laboratoire, notre interpréteur fonctionnera sur un simulateur web pour le robot écrit en JavaScript. Pour celà nous nous sommes servis du code du simulateur fourni pour cette partie du laboratoire. Dans le fichier interpreter.ts. Nous avons implémenté un visiteur qui parcourt l'AST et exécute les instructions du programme.

Dans le dossier "Interpreter", nous découvrirons le code du simulateur. Les fichiers TypeScript présents dans le répertoire "web/simulator" représentent les éléments de la simulation que nous utilisons dans notre interpréteur. Plus précisément, nous y localiserons la classe "Robot" qui sera manipulée par notre interprète. Quant aux fichiers JavaScript situés dans le répertoire "static/simulator", ils servent à afficher la simulation sur la page web. Ce code JavaScript anticipe la réception de l'état final de la scène simulée.

### Exécution du simulateur :
Nous devons à ce stade être en mésure de simuler le comportement de notre robot. Pour celà, nous allons utiliser le simulateur web fourni. Pour lancer le simulateur, il suffit à l'utilisateur de cliquer sur le boutton "Execute Simulation" de la page web.

Pour ensuite se rendre sur la page web de notre simulateur à l'adresse suivante : http://localhost:3000/

La technique utilisée pour communiquer entre le simulateur et l'interpréteur est la suivante :
    
    - L'interpréteur envoie une requête HTTP POST au simulateur pour lui demander d'exécuter une commande(Une fois que l'utilisateur  clique sur le boutton execute-simulation).
    
    - Le simulateur exécute la commande et renvoie l'état final de la scène simulée à l'interpréteur.
    
    - L'interpréteur reçoit l'état final de la scène simulée et le stocke dans une variable.
    
    - L'interpréteur continue à exécuter le reste du programme.
    
    - Lorsque l'interpréteur a terminé l'exécution du programme, il affiche l'état final de la scène simulée.
    
    - L'interpréteur affiche l'état final de la scène simulée.

[simulation.webm](https://github.com/guypi001/RobotML/assets/107374001/8e88647c-ffd6-4355-b544-d14d28d7962f)


### Compilation :

La dernière section de ce TP sera consacrer à l'élaboration du compilateur. Nous avons choisi de générer du code Arduino pour exécuter le comportement sur le robot réel. Pour celà nous avons implémenté un visiteur qui parcourt l'AST et génère le code Arduino correspondant.

