---
title: Write BuckleScript bindings - part 2
date: '2015-08-25T22:12:03.284Z'
language: en
translations: ['fr', 'fr/ecrire-des-bindings-reasonml-partie-2']
---

> You can find the first part [here](/en/write-reasonml-binding-part-1/)

In the first part, we had written a basic binding of a function which returns nothing. Now, we will take a look about how we can handle functions with complex return elements like `fs.createReadStream`.

## Start simply (again)

Let's start by writing simply this function without going for the edge cases, she can receive a `string` and return a stream that we're going to abstract like this :

```reason
type stream;

[@bs.module "fs"]
external createReadStream: string => stream = "createReadStream";
```

A stream own several methods, let's linger on some of them like :

- `pipe` that allow us to work with other streams
- `on` which is an event listener

With BuckleScript, it exists a directive allowing us to associate an abstract type to a method : `[@bs.send]`.

If we want to use the last pipe operation (`|>`), it's mandatory to precise the abstracted type in the directive : `[@bs.send.pipe myAbstractedType]`.

In our case, the last pipe operator make the use simplier, so we're gonna use it.
Let's first write the `pipe` function, his signature is simple, it takes an argument of type `stream` and return another `stream` :

```reason
/* ... */

[@bs.send.pipe stream]
external pipe: stream => stream = "pipe";
```

Later, we will call this function in our code like this :

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

Then add the function `on`, this one takes 2 parameters, an event type which is a string and a callback, the callback type will be different according to the event type. Let's start with the simplier case :

```reason
/* ... */
[@bs.send.pipe stream]
external on: (string, (unit => unit)) => stream = "on";

myStream
|> on("close", () => Js.log("Close"));
```

## Handle all the case

In the [BuckleScript's documentation](https://bucklescript.github.io/docs/en/function#special-case-event-listeners), we can find an example of our use case.
We mix two BuckleScript functionality :

- the directive `[@bs.string]` which is must be used **only in an external**
- a polymorphic variant which will contain the callback type

The `[@bs.string]` directive transform the name of the polymorphic variant into a string in the JavaScript part :

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

Now you won't be able to use an event that does not exist or a typo in your string !

## Conclusion

There are a lot of BuckleScript's directives that are really useful. Do not hesitate to read the [documentation](https://bucklescript.github.io/en/) to discover more !
