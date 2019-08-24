---
title: Écrire des bindings BuckleScript - partie 2
date: '2019-08-25T00:12:03.284Z'
language: 'fr'
tags: ['reasonml', 'bucklescript']
translations: ['en', 'en/hello-world']
---

> Vous pouvez retrouver la première partie [ici](/fr/ecrire-des-bindings-reasonml-partie-1/)

Dans la première partie, nous avons écrit les bindings d'une fonction simple ne retournant aucune valeur. À présent, nous allons voir comment nous pouvons gérer les fonctions retournant des éléments complexes comme `fs.createReadStream`

## Commencer simplement (encore)

Commençons par écrire la fonction le plus simplement possible sans prendre en compte les cas particuliers :

```reason
type stream;

[@bs.module "fs"]
external createReadStream: string => stream = "createReadStream";
```

Un stream possède plusieurs méthodes, attardons nous sur quelques-unes à savoir :

- `on` qui est un "listener" d'évènement
- `pipe` qui permet de travailler avec d'autres stream

En BuckleScript, il existe une directive permettant d'associer un type abstrait à une méthode : `[@bs.send]`.

S'il l'on souhaite utiliser le "last pipe operator" (`|>`), il est nécessaire de préciser le type abstrait dans la directive : `[@bs.send.pipe monTypeAbstrait]`.
