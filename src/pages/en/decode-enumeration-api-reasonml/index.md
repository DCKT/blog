---
title: Decode an enumeration from an API with decco
date: '2019-09-07T00:12:03.284Z'
language: 'en'
tags: ['reasonml']
translations: ['fr', 'fr/decoder-enumeration-api-reasonml']
---

In a previous article, I talked to you about [decco](https://github.com/ryb73/ppx_decco) to decode API payload. Today, we will see how we decode an enumeration of string with this library.

## Decoder composition

A decco decoder must composed of **4 elements**:

- a function `encoder` which handle serialization
- a function `decoder` which handle deserialization
- a variable `codec` which contains these functions (as a tuple)
- a type `t` who will be the type that we wish to decode/generate

#### Handle the serialization

When I need to work with a string enumeration, I tend to use the directive `[@bs.deriving jsConverter]` which generate automaticaly the functions allowing the permutation between a string and a type. Here is an example :

```reason
[@bs.deriving jsConverter]
type brand = [
  | `sony
  | `microsoft
  | `toyota
  | `apple
];

Js.log(brandToJs(`microsoft)); /* log "microsoft" */
brandFromJs("microsoft")->Belt.Option.map(v => Js.log(v)); /* log the generated id of the type */
```

A small but interesting details here is the `brandFromJs` function, it returns an `option(string)` type because it's possible to give an unexisting enum value and so return the `None` value.

Let's keep this brand type and write the serialization function :

```reason
[@bs.deriving jsConverter]
type brand = [
  | `sony
  | `microsoft
  | `toyota
  | `apple
];

let encoder: Decco.encoder(brand) = (brand: brand) => {
  brand->brandToJs->Decco.stringToJson;
};
```

Here, I declared the types explicitly to make it clearer but you also let the inference does it job !

About the `encoder` function, it takes a parameter of our type we need to convert and transform it in a `string` in order to invoke the `Decco.stringToJson` function who will make the JSON conversion.

The serialization is handled ! Nothing more is necessary, we can move on to the deserialization !

#### Handle the deserialization

It's quite the same like the serialization but with the error case to handle :

```reason
let decoder: Decco.decoder(brand) = json => {
  switch (json->Decco.stringFromJson) {
  | Belt.Result.Ok(v) => switch (v->brandFromJs) {
      | None => Decco.error(~path="", "Invalid enum " ++ v, json)
      | Some(v) => v->Ok
    }
  | Belt.Result.Error(_) as err => err
  };
};
```

In this example, we just need to note that `Decco.stringFromJson` function return a `Belt.Result.t` type and to raise an error we need to invoke the `Decco.error` function.

#### And the rest

It remains now the 2 variables to create that will be showed like that :

```reason
let codec: Decco.codec(brand) = (encoder, decoder);

[@decco]
type t = [@decco.codec codec] brand;
```

We **imperatively** associate the right type and here we are, we have our own decoder ! Let's bring this together into a module :

```reason
module BrandCoded = {
  [@bs.deriving jsConverter]
  type brand = [
    | `sony
    | `microsoft
    | `toyota
    | `apple
  ];

  let encoder: Decco.encoder(brand) = (brand: brand) => {
    brand->brandToJs->Decco.stringToJson;
  };

  let decoder: Decco.decoder(brand) = json => {
    switch (json->Decco.stringFromJson) {
    | Belt.Result.Ok(v) => switch (v->brandFromJs) {
        | None => Decco.error(~path="", "Invalid enum " ++ v, json)
        | Some(v) => v->Ok
      }
    | Belt.Result.Error(_) as err => err
    };
  };

  let codec: Decco.codec(brand) = (encoder, decoder);

  [@decco]
  type t = [@decco.codec codec] brand;
};
```

We can now use this module thanks to the ppx `[@decco.codec]` :

```reason
/*...*/

[@decco]
type console = {
  id: string,
  name: string,
  brand: [@decco.codec BrandCoded.codec] brand
};
```