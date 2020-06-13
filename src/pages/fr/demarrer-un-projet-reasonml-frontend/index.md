---
title: Démarrer un projet React en ReasonML
date: '2020-06-13T00:12:03.284Z'
language: 'fr'
tags: ['reasonml', 'react']
translations: []
---

Voilà un petit moment que vous entendez parler de l'utilisation de ReasonML avec le framework [React](https://reactjs.org/) mais vous n'avez pas encore eu l'occasion de vous y mettre vraiment ? Dans cet article, nous allons voir comment créer rapidement une application en React qui nous servira de fil rouge pour de futurs articles !

# Utiliser un générateur

Plutôt que de générer un projet avec [create-react-app](https://github.com/facebook/create-react-app) et de nettoyer les fichiers manuellement, il existe aujourd'hui un générateur nommé [spin](https://github.com/tmattio/spin) qui nous permet de créer facilement un projet ReasonML.

En reprenant la documentation, Spin dispose de plusieurs templates pour générer un projet.

Pour une application native, il existe 4 templates :

- **bin** : un projet natif qui génère un exécutable
- **cli** : une interface de commande déployable sur Opam (OCaml package manager)
- **lib** : une librairie déployable sur Opam (OCaml package manager)
- **ppx** : une librairie PPX préconçue pour du natif et BuckleScript

Pour une application BuckleScript, il n'existe qu'un seul template à l'heure actuelle :

- **bs-react** : une application React écrite en ReasonML

Nous allons donc utiliser `bs-react` pour générer notre projet, on peut maintenant installer spin et générer un template :

```bash
# install spin
yarn global add @tmattio/spin
# Or
npm -g install @tmattio/spin

# generate our project
spin new bs-react the-commerce
```

Vous devrez aller configurer le projet via l'interface de commande.

Petite subtilitée, le générateur nous propose d'ajouter [TailwindCSS](https://tailwindcss.com/), un framework CSS utilitaire très intéressant, dans cet article nous allons l'inclure dans notre application.

Et voilà ! Notre application a été généré, regardons de plus près son contenu..

## Sous le capot

On peut voir que Spin génère 3 fichiers de configuration dans le dossier `configuration` :

- postcss
- tailwind
- webpack

[PostCSS](https://postcss.org/) est un outil permettant de transformer du CSS avec du JavaScript, il existe de nombreux plugins comme [Autoprefixer](https://github.com/postcss/autoprefixer) qui, à partir d'une liste de navigateurs supportées va ajouter les préfixes nécessaires.

Pas besoin de revenir sur Tailwind qui a été présenté quelques lignes plus haut.

[Webpack](https://webpack.js.org/) quand à lui, est un "module bundler" (assembleur de fichiers), il va s'occuper de regrouper nos différents fichiers JavaScript et autres pour générer un seul (ou plus selon la configuration) utilisable en production. Tout comme PostCSS, il existe de nombreux plugins comme [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin) qui permet de générer et d'enrichir un fichier HTML.

## La structure d'un projet Spin

Celle-ci se rapproche fortement de create-react-app, avec un fichier `Index` qui sert de point de départ à l'application et d'un fichier `App` qui contient le code React de notre application.

On peut noter la présence d'un fichier `Router` et `Route` mais ne nous attardons pas la dessus aujourd'hui (dans un prochain article 😉)

Il n'existe pas vraiment de convention, mais la plupart sont d'accord sur un point : garder sa structure de fichier le plus plat possible. Cela simplifie beaucoup l'architecture de l'application et facilite le coût d'entrée pour un débutant.

En général, dans mes projets ReasonReact, j'ai une structure comme celle-ci :

```bash
> components # composants utilisés sur plusieurs pages
> pages # pages de l'application
> services # appel API, notifications, bug tracker, etc..
> resources # les types utilisés un peu partout
> vendor # les bindings qui n'existent pas
> locales # traductions
> tests # quand il y en a :p
```

# Conclusion

Nous avons un projet Reason React avec une solide base ! Il ne nous reste plus qu'à coder 😁
