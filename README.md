# Fetch-R

[![Build and Test Package](https://github.com/nexys-system/fetch-r/actions/workflows/build.yml/badge.svg)](https://github.com/nexys-system/fetch-r/actions/workflows/build.yml)
[![Publish](https://github.com/nexys-system/fetch-r/actions/workflows/publish.yml/badge.svg)](https://github.com/nexys-system/fetch-r/actions/workflows/publish.yml)
[![Deploy to docker](https://github.com/nexys-system/fetch-r/actions/workflows/deploy.yml/badge.svg)](https://github.com/nexys-system/fetch-r/actions/workflows/deploy.yml)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

Typescript ORM to connect to MySQL database

Typescript port of [Scala version](https://github.com/fetch-r/serverg)

[npm-image]: https://img.shields.io/npm/v/@nexys/fetchr.svg
[npm-url]: https://npmjs.org/package/@nexys/fetchr
[downloads-image]: https://img.shields.io/npm/dm/@nexys/fetchr.svg
[downloads-url]: https://npmjs.org/package/@nexys/fetchr.svg

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
- The strcuture is the one descrbied in [`/service/type`](https://github.com/nexys-system/fetch-r/blob/master/src/service/type.ts#L30)
- Models are stored in `/assets/models.json`

### Databases

- Models can be set using `/database/set`
- The strcuture is the one descrbied in [`/service/database/type`](https://github.com/nexys-system/fetch-r/blob/master/src/service/database/type.ts)
- Databases are stored in `/assets/databases.json`

When a query requiring a particular database is called, it will look for an associated connection pool. If none is found, it will create a new one based on the database record (if not found, an error is thrown) and store it in a `Map` object.
