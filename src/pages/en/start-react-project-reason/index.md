---
title: Start a React project in ReasonML
date: '2020-06-13T00:12:03.284Z'
language: 'en'
tags: ['reasonml', 'react']
translations: ['fr', 'fr/demarrer-un-projet-reasonml-frontend']
---

That's a little while about hearing the usage of ReasonML with the [React library](https://reactjs.org/) but you didn't had time to take a look seriously ? In this article, we're gonna see how to quickly create a React application which will serve as our common thread for the next articles !

# Use a generator

Rather than generate a project with [create-react-app](https://github.com/facebook/create-react-app) and clean-up files manually, it exists today a generator called [spin](https://github.com/tmattio/spin) which allow us to create ReasonML project with ease.

Resuming the documentation, Spin has severals templates to scaffold a project.

For a native application, there are 4 templates :

- **bin** : a native project who generated a binary
- **cli** : a CLI deployable on Opam (OCaml package manager)
- **lib** : a library deployable on Opam (OCaml package manager)
- **ppx** : a PPX library for native and BuckleScript usage

For a BuckleScript application, there is only one template at the time this article is written :

- **bs-react** : a React application written in ReasonML

So, we are gonna use `bs-react` to generate our project, we can now setup spin and generate a template :

```bash
# install spin
yarn global add @tmattio/spin
# Or
npm -g install @tmattio/spin

# generate our project
spin new bs-react the-commerce
```

You will have to configure the project through CLI.

A little subtility, the generator suggests adding [TailwindCSS](https://tailwindcss.com/), an utilitary CSS framework which is very interesting. We will include it in our application.

And voilà ! Our application has been generated, let's take a look closer to the content..

## Under the hood

We can see that Spin generate 3 configurations files in the folder `configuration` :

- postcss
- tailwind
- webpack

[PostCSS](https://postcss.org/) is a tool allowing to transform CSS with JavaScript, there are a lot of plugins like [Autoprefixer](https://github.com/postcss/autoprefixer) who, from a list of supported browsers, will add the prefix needed.

No need to come back on Tailwind which has been presented a few lines upper.

[Webpack](https://webpack.js.org/) is a "module bundler", he has to regroup every JavaScript files and others in order to generate only one (or more according to the configuration) usable in production. Like PostCSS, it exists a lot of plugins like [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin) which allow to generate and qui permet de générer et enrich a HTML file.

## The structure of a Spin project

This is very close to create-react-app, with an `index` file who serves as entry point of the application and an `App` file who contains the React code of our app.

We can note the presence of files like `Router` et `Route` but don't linger on this today (in a futur article 😉).

It doesn't really exist a convention, but mostly people agreed on a point : keep the file structure as flat as possible. It simplifies a lot the architecture and the entry cost for a novice.

Personally, I use this kind of structure in my Reason React projects :

```bash
> components # composants used in several pages
> pages # pages of the application
> services # API call, notifications, bug tracker, etc..
> resources # types used pretty much everywhere
> vendor # bindings that does not exist on npm
> locales # i18N
> tests # when there are :p
```

# Conclusion

We have a Reason React project with a solid structure ! Now let's code 😁 !
