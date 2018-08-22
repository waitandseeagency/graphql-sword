<p align="center">
<img width="200" src="https://raw.githubusercontent.com/waitandseeagency/graphql-sword/master/media/logo.svg?sanitize=true" alt="logo graphql-sword">
</p>

# graphql-middleware-permission-layer
> The perfect companion of `graphql-shield` to manage your permission layer following BREAD convention
<br>

* [Overview](#overview)
* [Installation](#installation)
* [Usage](#usage)
* [API](#api)
* [Licence](#licence)


## Overview

GraphQL Sword is a middleware for a GraphQL Server which helps you create a permission layer with `graphql-shield`, but following the BREAD permission structure.
<br>
The actual behavior is so inspired by the permissions logic from GCF (akak GraphCool Framework).


## Installation

```bash
yarn add graphql-sword graphql-middleware
```


## Usage
### Apollo Server v2

```ts
import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import { applyMiddleware } from 'graphql-middleware'
import { permissions, IPermission } from 'graphql-sword'

const app: express.Express = express()

const typeDefs = `
  type Query {
    frontPage: [Fruit!]!
    fruits: [Fruit!]!
    customers: [Customer!]!
  }

  type Mutation {
    addFruitToBasket: Boolean!
  }

  type Fruit {
    name: String!
    count: Int!
  }

  type Customer {
    id: ID!
    basket: [Fruit!]!
  }
`

const resolvers = {
  Query: {
    frontPage: () => [{name: "orange", count: 10}, {name: "apple", count: 1}]
  }
}

const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
})

// Queries
// You can directly check information from the context
const isAdminQuery = async (ctx): boolean => return ctx.user.role === 'admin'

// Or request Prisma to verify a specific rule
const isEditorQuery = async (ctx, node_id): boolean => 
  ctx.db.exists.User<boolean>({
    id: node_id,
    role: 'editor',
  })

const isCustomer = async (ctx, node_id): boolean =>
  ctx.db.exists.Customer<boolean>({
    id: node_id,
  })

// Permissions
const permissionsSetup: IPermission[] = [
  {
    operation: 'Fruit.Browse',
    alias: 'frontPage',
  },
  {
    operation: 'Fruit.Browse',
    authenticated: true,
    query: isEditorQuery,
  },
  {
    operation: 'Customer.Browse',
    authenticated: true,
    query: isAdminQuery,
  },
  {
    operation: 'Customer.Edit',
    authenticated: true,
    alias: 'addFruitToBasket',
    fields: ['basket'],
    query: isCustomer,
  },
  // Will be available later to add rule on a type directly
  // {
  //   operation: 'Customer.*',
  //   query: isAdminQuery,
  // },
]

// Middleware
const permissionsMiddlewareInternal = permissions(
  permissionsSetup,
)

const schemaWithMiddleware = applyMiddleware(
  schema,
  permissionsMiddlewareInternal,
)

const server = new ApolloServer({
  schema: schemaWithMiddleware,
  context: ctx => ({
    ...ctx,
    db, // any Prisma instance
    user: (<any>ctx.req).user || null,
  }),
})

server.applyMiddleware({ app, path: '/' });

app
  .listen(options, () => console.info(
    `🚀  Server ready at http://localhost:${options.port}${server.graphqlPath}`,
  ))
```

## API

### Types

```ts
// Permission
function permission(
  permissionsRules: IPermission[],
  _options?: IOptions,
): IMiddlewareGenerator<any, any, any>

interface IPermission {
  operation: string
  authenticated?: boolean
  alias?: string
  fields?: string[]
  query?: IPermissionQuery
  cache?: ICacheOptions
}

type IAction = 'Browse' | 'Read' | 'Edit' | 'Add' | 'Delete' | '*'
type ICache = ICacheOptions // inherited from graphql-shield
type IPermissionQuery = (ctx: any, T: any) => Promise<boolean>

interface IOptions {
  debug?: boolean
  authenticatedRule?: IPermissionRule
}

interface IPermissionRule {
  (
    args?: IPermissionArgs,
  ): Rule
}

interface IPermissionArgs {
  query?: IPermissionQuery
  fields?: string[]
  cache?: ICacheOptions
  action?: IAction
}
```

### `shield(rules?, options?)`
### `permissions(permissionsRules, options?)`

> Generates GraphQL Middleware layer from your permissions.

#### `permissionsRules`

An array of your wanted permissions. A permissions must contain the operation name and at lease one option. Actually, a permission is applied on query (`Query` or `Mutation`).
It will be available later to apply it on a type or field.

##### Limitations

Permissions are appended to a query directly to enforce the validation before the server make the request.
If you apply the `fields` options to a permission, it will also monitor it before the request.

But if the permission was apply to a type (or one of its fields), the verification will be done on the response of the request (so the result of the `resolver`), because the `resolver` need to populate the `parent` parameter.

##### Possibilities

More example are coming...

<br>

## Licence

MIT @ Johann Pinson
<br>
The icon used in the logo is made from [Icon Fonts](http://www.onlinewebfonts.com/icon) and is licensed by CC BY 3.0
