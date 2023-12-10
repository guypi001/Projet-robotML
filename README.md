# TP ASE : RoboML - Création d'un langage de manipulation de Robot

Bienvenue dans ce repo GitHub RoboML. Ce projet est issu de sessions de TP visant à créer un langage dédié (DSL) permettant de spécifier le comportement d’un petit robot. Il se distingue par la conception et l'implémentation complètes de l'écosystème RoboML, couvrant la modélisation du domaine, l'éditeur de texte avec ses services, un interpréteur basé sur un simulateur web, et enfin, un compilateur générant du code Arduino pour exécuter le comportement sur le robot réel.

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

## Partie 3 - Modélisation Exécutable
