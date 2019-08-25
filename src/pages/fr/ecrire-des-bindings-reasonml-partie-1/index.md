---
title: Écrire des bindings BuckleScript - partie 1
date: '2019-08-24T00:12:03.284Z'
language: 'fr'
tags: ['reasonml', 'bucklescript']
translations: ['en', 'en/hello-world']
---

Quand j'ai besoin d'utiliser une librairie JavaScript en ReasonML, j'écris ses "bindings" BuckleScript.
Dans cette série d'articles, nous allons créer les bindings de quelques fonctions de [Node.js](https://nodejs.org). Vous pouvez retrouver ces bindings [sur mon Github](https://github.com/DCKT/bs-node).

## Commencer simplement

Prenons le module [File System](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html), nous allons écrire la fonction `readFile` pour commencer.

Dans un premier temps, il est essentiel de bien connaitre la signature de la fonction afin d'éviter tout erreur à la runtime.
Cette fonction prend 2 paramètres :

- un chemin
- un callback commun à Node.js qui possède 2 arguments, une possible exception et une valeur et n'attends rien en retour

Le chemin sera une `string` et le callback sera composé d'un `Js.Nullable.t(Js.Exn.t)` pour l'exception qui peut avoir la valeur `null` et la valeur ici sera une `string`, cette fonction ne renvoyant rien aura pour type `unit`.

```reason
[@bs.module "fs"]
external readFile: (string, (Js.Nullable.t(Js.Exn.t), string) => unit) = "readFile";
```

On pourrait être tenter de rajouter des labels mais ici la fonction n'a que 2 entrées et ce sont des types différents, ça ne ferait qu'ajouter du bruit pour une faible utilité.

Afin de rendre le code plus lisible et plus souple, nous allons écrire créer un type parametré `callback` :

```reason
type callback('a) =  (Js.Nullable.t(Js.Exn.t), 'a) => unit;

[@bs.module "fs"]
external readFile: (string, callback(string)) => unit = "readFile";

readFile("path/something.txt", (err, data) =>
  switch (err->Js.Nullable.toOption) {
  | Some(e) => Js.log2("an error occured", e)
  | None => Js.log(data)
  }
);
```

Cela nous permet de ré-utiliser le type `callback` avec n'importe quel type de retour.

## Gérer tous les cas

Si vous connaissez bien l'API de [readFile](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_fs_readfile_path_options_callback), vous savez que cette fonction peut prendre un argument "options", celui-ci est situé entre le chemin et le callback et est optionnel, si l'on veut le même comportement, nous devons obligatoirement passer par des arguments labelisés.

```reason
type callback('a) =  (Js.Nullable.t(Js.Exn.t), 'a) => unit;

[@bs.module "fs"]
external readFile: (~path: string,  ~options: string=?, ~callback: callback(string), unit) => unit = "readFile";

readFile(
  ~path="path/something.txt",
  ~callback=
    (err, data) =>
      switch (err->Js.Nullable.toOption) {
      | Some(e) => Js.log2("something went wrong", e)
      | None => Js.log(data)
      },
  (),
);
```

Avant de parler du type d'options, notez bien le type `unit` en dernier argument, en ReasonML, lorsque votre fonction dispose d'un argument facultatif, vous devez toujours rajouter `unit` argument supplémentaire car dans ce langage tout est [currifié](https://fr.wikipedia.org/wiki/Curryfication). Sans ce unit, notre fonction ne sera jamais considéré comme "appelé" si elle ne contient pas le paramètre `options`.

Selon la documentation de Node.js, `options` peut prendre 2 types différents :

- un objet contenant l'encodage et le flag
- une string seule pour l'encodage

Malheureusement ce genre de cas ne peut être gérer sans fonction supplémentaire (on perd la notion du "0 cost bindings"), qui gère ces 2 cas.

Pour gérer différents types, nous allons utiliser un "variant" avec argument comme ceci :

```reason
type readFileOptions('a) =
  | Encoding: readFileOptions(string)
  | Config: readFileOptions(readFileOptionsConfig);
```

Pour créer un objet JavaScript avec BuckleScript, je préfère utiliser les directives déjà présentes plûtot que reconstruire moi-même l'objet :

```reason
[@bs.deriving abstract]
type readFileOptionsConfig = {
  encoding: Js.Nullable.t(string),
  flag: string
};

type readFileOptions('a) =
  | Encoding: readFileOptions(string)
  | Config: readFileOptions(readFileOptionsConfig);
```

Il faut maintenant modifier notre "external" de sorte qu'il puisse prendre n'importe quel argument, et créer notre fonction qui gérera le variant. Notre attribut étant facultatif, il faudra le déclarer comme une `option` et extraire sa valeur grâce à la fonction `Belt.Option.map`.

```reason
/* ... */

let readFile =
  (
    ~path: string,
    ~options: option((readFileOptions('a), 'a))=?,
    ~callback: callback(string),
    (),
  ) =>
_readFile(
  ~path,
  ~options=options->Belt.Option.map(((_, a)) => a),
  ~callback,
  (),
);

readFile(
  ~path="./src/toto.txt",
  ~options=(Encoding, "utf8"),
  ~callback=(_, d) => Js.log(d),
  (),
);
```

Le principe ici est de donner un tuple à 2 entrée avec en 1ère entrée notre variant et en 2ème entrée le contenu correspondant au type du variant. Pensez à bien utiliser le même paramètre dans la déclaration du type du paramètre options !

Le code complet :

```reason
type callback('a) = (Js.Nullable.t(Js.Exn.t), 'a) => unit;

[@bs.deriving abstract]
type optionsConfig = {
  encoding: Js.Nullable.t(string),
  flag: string,
};

[@bs.module "fs"]
external _readFile:
  (~path: string, ~options: 'a=?, ~callback: callback(string), unit) => unit =
  "readFile";

type readFileOptions('a) =
  | Encoding: readFileOptions(string)
  | Config: readFileOptions(optionsConfig);

let readFile =
    (
      ~path: string,
      ~options: option((readFileOptions('a), 'a))=?,
      ~callback: callback(string),
      (),
    ) =>
  _readFile(
    ~path,
    ~options=options->Belt.Option.map(((_, a)) => a),
    ~callback,
    (),
  );

/* Pas d'options */
readFile(
  ~path="./src/toto.txt",
  ~callback=(_, d) => Js.log(d),
  (),
);

/* Encoding string */
readFile(
  ~path="./src/toto.txt",
  ~options=(Encoding, "utf8"),
  ~callback=(_, d) => Js.log(d),
  (),
);

/* Config */
readFile(
  ~path="./src/toto.txt",
  ~options=(Config, optionsConfig(~encoding=Js.Nullable.return("toto"), ~flag="toto")),
  ~callback=(_, d) => Js.log(d),
  (),
);
```

## La suite

Dans la prochaine partie, nous allons créer les bindings d'une fonction qui retourne une valeur comme `fs.createReadStream`. Nous verrons alors comment gérer les retours de façon abstraite.
N'hésitez pas à me partager votre façon d'écrire vos bindings [sur Twitter](https://www.twitter.com/DCK__) !
