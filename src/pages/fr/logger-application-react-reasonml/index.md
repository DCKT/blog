---
title: Utiliser un logger dans une application React en ReasonML
date: '2020-06-14T00:12:03.284Z'
language: 'fr'
tags: ['reasonml', 'bucklescript']
translations: []
---

Comme la plupart des développeurs front-end, j'ai déjà oublié par le passé d'enlever mes logs de debug une fois la mise en production passée 😖.

Cependant, depuis que je développe mes applications avec ReasonML, ce n'est plus jamais arrivé grâce à une librairie nommée [bs-log](https://github.com/MinimaHQ/bs-log).

# Les intérêts

Voici une liste des features de cette librairie :

- Pas de déclenchement à la runtime en production
- Plusieurs niveaux de logs
- Customisation des niveaux de logs via une variable d'environnement
- Intégration avec [ReasonReact](https://reasonml.org/docs/reason-react/latest/introduction)

Les niveaux de logs vont nous permettre d'afficher différents types d'informations, il en existe 4 :

- debug
- info
- warn
- error

Chacun de ces niveaux de logs aura un rendu différent dans la console (screen provenant du repo github) :
![log](https://github.com/MinimaHQ/bs-log/raw/master/.assets/example.png)

Ces niveaux ont une hiérarchie, de debug à error, grâce à cela il est possible de choisir un niveau de log en fonction d'une variable d'environnement à utiliser lors de la compilation, petit exemple avec ce code :

```reason
[%log.debug "hello world"];
[%log.warn "Warning !"];
[%log.error "An error occured"];
```

```shell
BS_LOG=warn bsb -clean-world -make-world
```

Une fois le code compilé, si l'on execute notre programme, celui-ci n'affichera pas notre `log.debug`.

# Un log utile

logger c'est bien, mais une fois en production, il nous faut un moyen pour tracer efficacement les erreurs de notre application. Pour cela, vous pouvez utiliser un traqueur de bugs comme [Sentry](https://sentry.io/) qui dispose d'un SDK JavaScript.

Ce genre de traqueur pose des évènements sur notre application en cas d'erreurs JavaScript, mais en plus de cela, nous permet de déclarer nous même des évènements. En voici un exemple :

```js
const fetchApi = () => {
  return axios
    .get('/mon-api')
    .then(res => res.data)
    .catch(err => {
      console.log(err)
      Sentry.captureException(err)
    })
}
```

Dans ce morceau de code, on peut relever 2 problèmes :

- en mode développement, une exception Sentry va être crée
- en mode production, le log va être affiché

Vous pouvez toujours gérer ça avec des variables d'environnements et des conditions mais avec une solution comme [bs-log](https://github.com/MinimaHQ/bs-log), nous allons combiner les 2 grâce à un **logger custom**.

## Un logger custom

Pour créer un logger custom, il suffit de créer un fichier et de surcharger les fonctions que l'on souhaite utiliser, voici un exemple :

```reason
/* SentryTracker.re */
open BsSentryReactNative;

let error = (__module__, event) => Sentry.captureMessage(event);

let errorWithData = (__module__, event, (label, data)) =>
  Sentry.(
    withScope(scope => {
      scope->Scope.setExtra(label, data);
      captureMessage(event);
    })
  );

let errorWithData2 = (__module__, event, (label1, data1), (label2, data2)) =>
  Sentry.(
    withScope(scope => {
      scope->Scope.setExtra(label1, data1);
      scope->Scope.setExtra(label2, data2);
      captureMessage(event);
    })
  );
```

Maintenant il faut juste s'assurer d'avoir 2 scripts différents, un pour le mode production qui va prendre notre SentryTracker et un autre sans :

```json
/* package.json */

{
  "scripts": {
    "dev": "bsb -make-world -w",
    "build": "BS_LOGGER=SentryTracker bsb -make-world"
  }
}
```

# Conclusion

Vous n'avez maintenant plus aucune excuses pour laisser passer des logs en production 😛
