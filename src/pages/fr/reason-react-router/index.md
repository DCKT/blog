---
title: Gérer la navigation dans une application Reason React
date: '2020-06-17T00:12:03.284Z'
language: 'fr'
tags: ['reasonml', 'react', 'navigation', 'front-end']
translations: []
---

En général, dans une application web, la navigation est gérée coté front-end. Dans un projet React, on aura tendance à favoriser l'usage d'une librairie comme [React Router](https://github.com/ReactTraining/react-router).

[ReasonReact](https://reasonml.org/docs/reason-react/latest/introduction) possède un système de navigation à la fois simple et performant. Nous pouvons à partir de cette API, nous créer notre propre "framework".

# Étudions l'API

Commençons tout d'abord par observer ce que nous propose [l'API](https://reasonml.org/docs/reason-react/latest/router) de ReasonReact.
On peut noter qu'il y a 6 fonctions dont 1 hook :

- `push(string)` prend un chemin et va mettre à jour l'URL
- `replace(string)` remplace l'URL courante, elle ne sera pas ajouté à l'historique
- `watchUrl(f)` qui prend un callback est un écouteur d'évènement qui, dès lors que l'URL va changer, va appeler ce callback en lui passant des informations.
- `unwatchUrl(watcherID)` nous permet de supprimer un écouteur d'évènement déclaré
- `dangerouslyGetInitialUrl()` va récupérer les informations autour de l'url (path, hash, search)
- `useUrl` est un hook React qui permet d'avoir accès à l'url courante sans déclarer les fonctions décrite plus haut.

Voici un exemple basique d'utilisation :

```reason
/* App.re */

module PageHome = {
  [@react.component]
  let make = () => {
    <h1>"Home"->React.string</h1>
  }
};

module PageProducts = {
  [@react.component]
  let make = () => {
    <h1>"Products"->React.string</h1>
  }
};

module PageProductDetails = {
  [@react.component]
  let make = (~productId) => {
    <h1>{("Product "++ productId)->React.string}</h1>
  }
};

[@react.component]
let make = () => {
  let route = ReasonReactRouter.useUrl();

  switch (route.path) {
    | [""] => <PageHome />
    | ["products"] => <PageProducts />
    | ["products", productId] => <PageProductDetails productId />
    | _ => <strong>"This page does not exist !"->React.string</strong>
  };
};
```

Tout est géré grâce au [pattern matching de ReasonML](https://reasonml.org/docs/manual/latest/pattern-matching) qui nous permet de décomposer la liste `path`.

# Une navigation type safe

Cette façon de faire est très bien pour une petite application de quelques pages, mais à partir du moment ou vous allez devoir gérer plusieurs niveaux de navigations et de l'authentification, vous risquez de vous heurter à différents problèmes.

J'ai choisi le mot anglais `type safe` pour illustrer cette partie de l'article car c'est le plus gros point faible de notre routeur comme il est écrit maintenant. La représentation d'une route par une string est bien trop vague et permissive !

En effet, notre routeur ici n'est pas à l'abri d'une erreur de typographie ! Une simple erreur dans l'utilisation d'une URL peut casser le comportement de votre application alors que celle-ci compile sans problème. C'est pourquoi nous allons créer notre **type route**.

## Elaboration de notre type

Je pense qu'un variant est le type qui peut le mieux convenir à notre cas d'usage : une énumération.

On peut alors représenter notre liste de route comme ceci :

```reason
type route =
  | Home
  | Products
  | NotFound;
```

Une question peut se poser ici, comment gérer les URLs possédant des informations dynamiques comme des ID ?
Les variants en ReasonML peuvent posséder un [type **constructeur**](https://reasonml.org/docs/manual/latest/variant#constructor-arguments) qui peut être n'importe quel autre type.

```reason
type route =
  | Home
  | Products
  | ProductDetails(string)
  | NotFound;
```

> Je n'aime pas utiliser le type string pour ce genre d'informations mais nous y reviendrons dans un prochain article pour éviter de nous éparpiller.

Voilà notre énumération de routes faite, nous devons à présent faire comprendre à notre logiciel comment convertir une URL en `route` et vice-versa

## Convertir notre type

Comme énoncé au dessus, nous avons 2 besoins :

- tranformer l'url que l'on reçoit de l'API Reason React en type route
- transformer un type route en URL

Pour procéder à cela, pas de magie ! Nous allons faire une fonction pour chacun des cas sur lesquelles nous allons utiliser le [pattern matching](https://reasonml.org/docs/manual/latest/pattern-matching).

**Tranformer l'url que l'on reçoit de l'API Reason React en type route :**

```reason
let routeFromUrl = (url: ReasonReact.Router.url) => switch (url.path) {
    | [""] => Home
    | ["products"] => Products
    | ["products", productId] => ProductDetails(productId)
    | _ => NotFound
  };
```

**Transformer un type route en URL**

```reason
let routeToUrl = switch (route) {
    | Home => ""
    | Products => "/products"
    | ProductDetails(productId) => "products/"++productId
    | NotFound => "/404"
  };
```

On peut regrouper le tout dans un fichier `Navigation.re` :

```reason
/* Navigation.re */

type route =
  | Home
  | Products
  | ProductDetails(string)
  | NotFound;

let routeFromUrl = (url: ReasonReact.Router.url) => switch (url.path) {
  | [""] => Home
  | ["products"] => Products
  | ["products", productId] => ProductDetails(productId)
  | _ => NotFound
};
let routeToUrl = switch (route) {
  | Home => ""
  | Products => "/products"
  | ProductDetails(productId) => "/products/"++productId
  | NotFound => "/404"
};
```

## Utiliser notre type

On peut dès à présent utiliser notre type dans notre exemple du début :

```reason
open Navigation;

/* ... */

[@react.component]
let make = () => {
  let route = ReasonReactRouter.useUrl();

  switch (route->routeFromUrl) {
    | Home => <PageHome />
    | Products => <Products />
    | ProductDetails(productId) => <PageProductDetails productId />
    | NotFound => <strong>"This page does not exist !"->React.string</strong>
  };
};
```

À présent, si l'on doit ajouter une nouvelle route, il faudra l'ajouter à notre énumération et gérer les endroits ou l'on pattern match notre route, sinon notre compilateur nous indiquera qu'il manque la gestion d'un cas.

## Générer des liens

Il manque un exemple, l'utilisation de lien dans notre application. On va utiliser notre fonction `routeToUrl` pour convertir une route en string :

```reason
open Navigation;

module PageHome = {
  [@react.component]
  let make = () => {
    <>
      <h1>"Home"->React.string</h1>
      <a href=Products->routeToUrl onClick={event => {
        event->ReactEvent.Synthetic.preventDefault;
        ReasonReact.Router.push(Products->routeToUrl);
      }}>
        "Products"->React.string
      </a>
    </>
  }
};
```

On ne va pas se mentir, c'est très fastidieux à l'usage pour un simple lien..
C'est pourquoi, nous allons en faire un composant ! Ajouter cela dans notre fichier `Navigation.re`

```reason
/* Navigation.re */

...

module Link = {
  [@react.component]
  let make = (~route, ~children) => {
    <a href=route->routeToUrl onClick={event => {
        event->ReactEvent.Synthetic.preventDefault;
        ReasonReact.Router.push(route->routeToUrl);
      }}>
      children
    </a>
  };
};
```

Cela devient tout de même plus simple à l'usage ! Et surtout, **type-safe** ! Impossible de mettre une route qui n'existe pas en faisant une erreur de typographie sans que ça casse la compilation !

```reason
open Navigation;

module PageHome = {
  [@react.component]
  let make = () => {
    <>
      <h1>"Home"->React.string</h1>
      <Link route=Products>
        "Products"->React.string
      </Link>
    </>
  }
};
```

## Gérer des routes imbriquées

Au bout d'un moment, vous allez avoir plusieurs niveaux de navigation. Pas besoin de changer notre code, grâce au pattern matching et au variant, nous pouvous déjà gérer des routes imbriquées, en voici un exemple :

```reason
type routeAdmin =
  | Dashboard
  | DashboardProducts
  | DashboardProductDetails(string)

type route =
  | Home
  | Products
  | ProductDetails(string)
  | Admin(route);


let routeFromUrl = (url: ReasonReact.Router.url) => switch (url.path) {
  | [""] => Home
  | ["products"] => Products
  | ["products", productId] => ProductDetails(productId)
  | ["admin", ...rest] => {
      switch (rest) {
        | [""] => Dashboard
        | ["products"] => DashboardProducts
        | ["products", productId] => DashboardProductDetails(productId)
      }
    }
  | _ => NotFound
};

let routeToUrl = switch (route) {
  | Home => ""
  | Products => "/products"
  | ProductDetails(productId) => "/products/"++productId
  | Admin(Home) => "/admin"
  | Admin(DashboardProducts) => "/admin/products"
  | Admin(DashboardProductDetails(productId)) => "/admin/products/" ++ productId
  | NotFound => "/404"
};
```

Comme en JavaScript, il est possible d'utiliser le [spread operator](https://reasonml.org/docs/manual/latest/list-and-array#immutable-prepend) pour décomposer notre liste.

# Conclusion

Nous voilà avec un solution de navigation assez simpliste mais robuste ! Dans un prochain article, nous allons rendre la navigation encore plus safe en utilisant un type pour nos ID plutôt qu'une simple string !
