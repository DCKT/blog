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

Commençons par écrire la fonction le plus simplement possible sans prendre en compte les cas particuliers, elle peut prendre une `string` et retourne un stream que nous allons abstraire comme ceci :

```reason
type stream;

[@bs.module "fs"]
external createReadStream: string => stream = "createReadStream";
```

Un stream possède plusieurs méthodes, attardons nous sur quelques-unes à savoir :

- `pipe` qui permet de travailler avec d'autres stream
- `on` qui est un "listener" d'évènement

En BuckleScript, il existe une directive permettant d'associer un type abstrait à une méthode : `[@bs.send]`.

S'il l'on souhaite utiliser le "last pipe operator" (`|>`), il est nécessaire de préciser le type abstrait dans la directive : `[@bs.send.pipe monTypeAbstrait]`.

Dans notre cas, le "last pipe operator" rend l'usage de ces deux fonctions plus lisibles, nous allons donc nous en servir. Écrivons d'abord la fonction `pipe`, sa signature est simple, elle prend un argument de type `stream` et retourne un `stream` :

```reason
/* ... */

[@bs.send.pipe stream]
external pipe: stream => stream = "pipe";
```

À l'usage, nous aurons ceci :

```reason
type stream;

[@bs.module "fs"]
external createReadStream: string => stream = "createReadStream";

[@bs.module "fs"]
external createWriteStream: string => stream = "createWriteStream";

[@bs.send.pipe stream]
external pipe: stream => stream = "pipe";

let myStream = createReadStream("./somePath");

myStream
|> pipe(createWriteStream("./aPath"));
```

Ajoutons ensuite la fonction `on`, celle-ci prends 2 paramètres, un type d'évènement qui est une string et un callback, le type du callback va dépendre du type d'évènement, nous allons prendre le cas le plus simple et gérer les autres cas par la suite :

```reason
/* ... */
[@bs.send.pipe stream]
external on: (string, (unit => unit)) => stream = "on";

myStream
|> on("close", () => Js.log("Close"));
```

## Gérer tous les cas

Dans la [documentation de BuckleScript](https://bucklescript.github.io/docs/en/function#special-case-event-listeners), on peut retrouver un exemple de notre cas d'usage.
Cela s'avère possible grâce à la fusion de ces deux éléments :

- la directive `[@bs.string]` qui ne peut être utilisé **que dans un external**
- un variant polymorphique qui contiendra le type du callback

La directive `[@bs.string]` permet de transformer le nom du variant polymorphique en string pour la partie JavaScript :

```reason
/* ... */
[@bs.send.pipe stream]
external on:
  (string, [@bs.string] [ | `close(unit => unit) | `data('a => unit)]) =>
  stream =
  "on";

myStream
|> on(`data(value => Js.log(value)))
|> on(`close(() => Js.log("End")));
```

Ainsi, il nous sera impossible d'utiliser un évènement qui n'existe pas ou de faire une erreur de typo !

## Conclusion

Il existe de nombreuses directives BuckleScript qui sont très utiles. N'hésitez pas à parcourir la [documentation](https://bucklescript.github.io/en/) pour en découvrir d'autres !
