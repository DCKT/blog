---
title: Write BuckleScript bindings - part 1
date: '2015-08-24T22:12:03.284Z'
language: en
translations: ['fr', 'fr/ecrire-des-bindings-reasonml-partie-1']
---

When I need to use a JavaScript library in ReasonML, I write his BuckleScript bindings.
In this articles series, we will create some [Node.js](https://nodejs.org) bindings. You can find these bindings [on my Github](https://github.com/DCKT/bs-node).

## Start simply

Take the [File System](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html) module, we will write the `readFile` function to begin.

Firstly, it's essential to know the function signature to avoid runtime error. This function takes 2 parameters :

- a path
- a callback, common to Node.js world, it has 2 arguments which are an eventual exception and a value, it doesn't return any value

The path will be a `string` and the callback will be composed of a `Js.Nullable.t(Js.Exn.t)` type for the exception because of the possible nullity and for the value a `string`. This function return nothing will have `unit` has type.

```reason
[@bs.module "fs"]
external readFile: (string, (Js.Nullable.t(Js.Exn.t), string) => unit) = "readFile";
```

We could attempted to add labels but here this function owns 2 entries only and they are differents types, it would just add noise for a low utility .

In order to make our code more readable and more flexible, we will create a parameterized type `callback` :

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

This allow us to re-use the `callback` type with any kind values.

## Handle every case

If you know well the [readFile](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_fs_readfile_path_options_callback) API, you know that function can take a third parameter disposed between the path and the callback, and is optionnal.
For this kind of behavior, you must use labeled arguments.

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

Before talking about the `options` type, take a look at the `unit` disposed as the fourth argument. In ReasonML, everything is [currified](https://en.wikipedia.org/wiki/Currying) so when your function contains an optionnal argument, you must add the `unit` in order to mark the function "as finished".

According to the Node.js documentation, `options` can be 2 differents types :

- an object containing the encoding and the flag
- a string only for the encoding

Sadly, this kind of case cannot be handled without additionnal function (we lost the notion of "0 cost bindings"), who handle theses 2 cases.

To handle these differents types, we will use a parameterized variant like this :

```reason
type readFileOptions('a) =
  | Encoding: readFileOptions(string)
  | Config: readFileOptions(readFileOptionsConfig);
```

To create a JavaScript object with BuckleScript, I prefer to use the existing directives rather than making the object myself :

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

Now we have to edit our external so he can take any argument and create the function who will handle the variant. This variant being optional don't forget to declare it as an `option` and extract this value thanks to `Belt.Option.map` function.

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

The principle here is to use a tuple with 2 entries, the first one with our variant and the second with the content of this variant.

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

## To be continued

In the next part, we will create bindings of `fs.createReadStream` which return a value.
So we will see how to abstract the returned type.
Share me how you write your bindings [on Twitter](https://www.twitter.com/DCK__) !
