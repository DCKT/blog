---
title: Décoder un retour API en ReasonML
date: '2019-09-01T00:12:03.284Z'
language: 'fr'
tags: ['reasonml']
translations: []
---

En ReasonML, lorsque l'on récupère les informations d'une API, on se retrouve à parcourir l'objet manuellement et à se baser sur l'inférence :

```reason
let fetchCats = () =>
  Axios.get("someapi.com/cats")
  |> Js.Promise.then_(response => Js.Promise.resolve(response##data))
  |> Js.Promise.then_(data => {
    data##cats->Belt.Array.map(cat => {
      Js.log(cat##name);
      Js.log(cat##age);
    })
    Js.Promise.resolve();
  });
```

Ce genre de pratique n'est pas recommandable, si votre projet prend de l'ampleur vous risquez de vous retrouver avec des types différents selon les endpoints si vous manquez de rigueur.

## Associer les données à une ressource

Pour associer les données d'une API à une ressource, nous avons plusieurs façons de faire :

- créer la ressource à la main via un type `record`
- Décoder les données de l'API avec un "serializer"

Observons chacun des cas, commençons par la création de la ressource avec un type `record` :

```reason
type cat = {
  name: string,
  age: int
};

type catApiPayload = {
  .
  "name": string,
  "age": int
};

let fromJs = (catApiPayload) => {
  name: catApiPayload##name,
  age: catApiPayload##age,
};

let fetchCats = () =>
  Axios.get("someapi.com/cats")
  |> Js.Promise.then_(response => Js.Promise.resolve(response##data))
  |> Js.Promise.then_(data => {
    let cats = data##cats->Belt.Array.map(cat => fromJs(cat));

    Js.Promise.resolve(cats);
  });
```

On peut constater que c'est très verbeux et demande de la rigueur.
Si la ressource venait à évoluer, il faudrait modifier chaque type et sa fonction de conversion, mais le point le plus problématique et que ce n'est pas **type safe**.

Ici dans notre cas, on ne peut pas déterminer si l'API retourne vraiment un `int` pour l'age du chat autrement qu'à la "run-time" dès lorsque l'on va utiliser cette valeur. C'est pour cela qu'il existe des solutions de "décodages" que je vais vous présenter ici.

#### bs-json

L'un des modules les plus connus pour décoder du JSON est [bs-json](https://github.com/glennsl/bs-json), il nous permet de créer un décodeur pour un type donnée comme ceci :

```reason
type cat = {
  name: string,
  age: int
};

module Decode = {
  let cat = json =>
    Json.Decode.{
      name: json |> field("name", string),
      age: json |> field("age", int)
    };
};

let fetchCats = () =>
  Axios.get("someapi.com/cats")
  |> Js.Promise.then_(response => Js.Promise.resolve(response##data))
  |> Js.Promise.then_(data => {
    let decodedCats = data##cats->Belt.Array.map(cat => cat |> Json.parseOrRaise |> Decode.cat);

    Js.Promise.resolve(decodedCats);
  });
```

Si l'API nous retourne une liste de chat avec un mauvais type, nous aurons une erreur à la "run-time" bien avant l'utilisation de valeur.

Cepdendant cela reste assez verbeux, à chaque nouvelle entrée, il faut l'ajouter dans notre décodeur. J'ai découvert récemment une librairie permettant la même chose sans le coté verbeux.

#### decco

C'est une librairie qui permet via l'usage d'un [ppx](https://blog.hackages.io/reasonml-ppx-8ecd663d5640) de générer automatiquement des décodeurs/encodeurs à partir d'un type !

```reason
[@decco]
type cat = {
  name: string,
  age: int
};

[@decco]
type catList = {
  cats: array(cat)
};

let fetchCats = () =>
  Axios.get("someapi.com/cats")
  |> Js.Promise.then_(response => Js.Promise.resolve(response##data))
  |> Js.Promise.then_(data => {
    data
    |> catList_decode
    |> Belt.Result.getExn
    |> Js.Promise.resolve;
  });
```

## Conclusion

Decco est simple à mettre en place et utiliser pourquoi s'en priver ? De plus, il gère des types complèxes et nous permet de créer nos propres décodeurs (pour gérer des dates ou des énumérations par exemple).

Dans mon prochain article, nous allons créer un décodeur d'énumérations et le rendre générique grâce aux [functor](https://reasonml.github.io/docs/en/module#module-functions-functors) !
