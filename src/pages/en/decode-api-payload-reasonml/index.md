---
title: Decode an API payload with ReasonML
date: '2019-09-05T00:12:03.284Z'
language: 'en'
tags: ['reasonml']
translations: ['fr', 'fr/decoder-retour-api-reasonml']
---

When you fetch data from an API with ReasonML, we end up parsing the object manually and let the inference do his job :

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

This kind of practise is not recommandable, if your project scale, you risk to end up with differents types in your app if you aren't rigorous.

## Associate the data to a resource

To associate API data to a resource, we have a few how to :

- create the resource by hand with a `record` type
- Decode the API data with a "serializer"

Let's take a look to each case, let's first begin with the `record` type :

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

We can notice that is very verbose and require some rigor.
If this resource should evolve, we should have to edit the type and the conversion function, but the most problematic point is the non **type safety**.

Here in our case, we cannot determinate if the API really give us an `int` for the cat's age except at the "runtime" when we will use this value. This is why there exists decoding solutions called "serializers". Let me present you some of them.

#### bs-json

One of the most popular module for JSON decoding is [bs-json](https://github.com/glennsl/bs-json), it allow us to create a decoder for a given type like this :

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

If the API return an array of cats with a bad type, we will get an error directly at the first entry point of the API call with a pretty clear message !

However, this is still pretty verbose, for each new entry, you have to add it to our decoder.

Recently, I discover a library without omitting the verbose part.

#### decco

This module is called [decco](https://github.com/ryb73/ppx_decco), it's based on a [ppx](https://blog.hackages.io/reasonml-ppx-8ecd663d5640) which generate automatically the decoder/encoder from a given type !

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

Decco is really simple to setup and to use, give it a try ! Also, this module can handle complex types and you can also create your own decoders (when you need to handle date or enumeration as example).

In my next article, we will create an enumeration decoder and make it generic thanks to the [functor](https://reasonml.github.io/docs/en/module#module-functions-functors) !
