# Fetch-R

[![Build and Test Package](https://github.com/nexys-system/fetch-r/actions/workflows/build.yml/badge.svg)](https://github.com/nexys-system/fetch-r/actions/workflows/build.yml)
[![Publish](https://github.com/nexys-system/fetch-r/actions/workflows/publish.yml/badge.svg)](https://github.com/nexys-system/fetch-r/actions/workflows/publish.yml)
[![Deploy to docker](https://github.com/nexys-system/fetch-r/actions/workflows/deploy.yml/badge.svg)](https://github.com/nexys-system/fetch-r/actions/workflows/deploy.yml)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Bundlephobia](https://badgen.net/bundlephobia/min/@nexys/fetchr)](https://bundlephobia.com/result?p=@nexys/fetchr)
![Code style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)

Typescript ORM to connect to MySQL database

_experimental support for PostgreSQL_

Typescript port of [Scala version](https://github.com/nexys-system/fetch-r-scala)

[npm-image]: https://img.shields.io/npm/v/@nexys/fetchr.svg
[npm-url]: https://npmjs.org/package/@nexys/fetchr
[downloads-image]: https://img.shields.io/npm/dm/@nexys/fetchr.svg
[downloads-url]: https://npmjs.org/package/@nexys/fetchr.svg

## Get started with the package

### Install

```
yarn add @nexys/fetchr
```

### Use

```
import FetchR from "@nexys/fetchr";
import { Database } from "@nexys/fetchr/dist/database/type";
import { Entity } from "@nexys/fetchr/dist/type";

const model: Entity[] = [
  {
    name: "User",
    uuid: false,
    fields: [
      { name: "firstName", type: "String", optional: false },
      { name: "lastName", type: "String", optional: false },
      { name: "email", type: "String", optional: false },
    ],
  },
];

const dbConfig: Database = {
  username: "",
  host: "",
  password: "",
  database: "",
  port: 3306,
};

const fetchr = new FetchR(dbConfig, model);

fetchr.mutate({
  User: {
    insert: {
      data: { firstName: "john", lastName: "doe", email: "john@doe.com" },
    },
  },
});

// get all users
fetchr.query({ User: {} });

// get all users' emails whose names are "john"
fetchr.query({
  User: { projection: { firstName: true }, filters: { firstName: "John" } },
});
```

## Querying

There are 2 endpoints for querying: `/data` and `/mutate`. As their names suggests, the first one retrieves data and the second alters them. This is based on the same philosophy that was adopted by [graphql](https://graphql.org/learn/queries/).

## Data

This is the query endpoint: `/query` (for legacy reason the endpoint `/data` is also available)

The querying language is very easy is straightforward and follows the structure defined [here](https://github.com/nexys-system/fetch-r/blob/master/src/service/type.ts#L65).

Note that the endpoint always returns an object with the different entities queries as keys and the result in the form of an array as values.

### Query Example

- get a list of user from the entity `User`

```
{User: {}}
```

- get a list of user belonging to a particulart workspace

```
{User: {workspace:{id: workspaceId}}}
```

## Mutate

Available through `/mutate`. The following actions are available

- `insert`
- `update`
- `delete`

## Model and Databases

The service supports multi models/databases

### Models

- Models can be set using `/model/set`
- The strcuture is the one descrbied in [`/service/type`](https://github.com/nexys-system/fetch-r/blob/master/lib/service/type.ts#L30)
- Models are stored in `/assets/models.json`

### Databases

- Models can be set using `/database/set`
- The strcuture is the one descrbied in [`/service/database/type`](https://github.com/nexys-system/fetch-r/blob/master/src/lib/database/type.ts)
- Databases are stored in `/assets/databases.json`

When a query requiring a particular database is called, it will look for an associated connection pool. If none is found, it will create a new one based on the database record (if not found, an error is thrown) and store it in a `Map` object.

### Migrations

The migration engines is largely inspired from flyway. An array of migrations can be passed; each having a unique combination of index and version (e.g. `2.1`, `2.2` etc). Migrations are stored in a separate table with their checksum values.

### GraphQL

GraphQL support is available. See https://github.com/nexys-system/server-boilerplate/blob/master/README.md#graphql-query-examples-tested-in-postman for more information
