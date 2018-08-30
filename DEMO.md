# GraphQL Sword

## Demo and examples

This is an exhaustive list of permission for the model `User` and the result expected.

<br>

### Read
```ts
// Permission
{
  operation: 'User.Read',
}

// Rule apply on
Query.user() { ... }
```

```ts
// Permission
{
  operation: 'User.Read',
  alias: 'me',
}

// Rule apply on
Query.me() { ... }
```

```ts
// Permission
{
  operation: 'User.Read',
  fields: ['email'],
}

// Rule apply on
Query.user() { email }
```

```ts
// Permission
{
  operation: 'User.Read',
  alias: 'me',
  fields: ['email'],
}

// Rule apply on
Query.me() { email }
```
<br>

### Browse
```ts
// Permission
{
  operation: 'User.Browse',
}

// Rule apply on
Query.users() { ... }
```

```ts
// Permission
{
  operation: 'User.Browse',
  alias: 'allUsers',
}

// Rule apply on
Query.allUsers() { ... }
```

```ts
// Permission
{
  operation: 'User.Browse',
  fields: ['email'],
}

// Rule apply on
Query.users() { email }
```

```ts
// Permission
{
  operation: 'User.Browse',
  alias: 'allUsers',
  fields: ['email'],
}

// Rule apply on
Query.allUsers() { email }
```
<br>

### Add
```ts
// Permission
{
  operation: 'User.Add',
}

// Rule apply on
Query.addUser() { ... }
```

```ts
// Permission
{
  operation: 'User.Add',
  alias: 'signup',
}

// Rule apply on
Query.signup() { ... }
```

```ts
// Permission
{
  operation: 'User.Add',
  fields: ['email'],
}

// Rule apply on
Query.addUser(data: { email }) { ... }
```

```ts
// Permission
{
  operation: 'User.Add',
  alias: 'signup',
  fields: ['email'],
}

// Rule apply on
Query.signup(data: { email }) { ... }
```
<br>

### Edit
```ts
// Permission
{
  operation: 'User.Edit',
}

// Rule apply on
Query.editUser(data: { ... }, where: { ... }) { ... }
```

```ts
// Permission
{
  operation: 'User.Edit',
  alias: 'editCurrentUser',
}

// Rule apply on
Query.editCurrentUser(data: { ... }, where: { ... }) { ... }
```

```ts
// Permission
{
  operation: 'User.Edit',
  fields: ['email'],
}

// Rule apply on
Query.editUser(data: { email, ... }, where: { ... }) { ... }
```

```ts
// Permission
{
  operation: 'User.Edit',
  alias: 'editCurrentUser',
  fields: ['email'],
}

// Rule apply on
Query.editCurrentUser(data: { email, ... }, where: { ... }) { ... }
```
<br>

### Delete
```ts
// Permission
{
  operation: 'User.Delete',
}

// Rule apply on
Query.deleteUser(where: { ... }) { ... }
```

```ts
// Permission
{
  operation: 'User.Delete',
  alias: 'removeUser',
}

// Rule apply on
Query.removeUser(where: { ... }) { ... }
```

```ts
// Permission
{
  operation: 'User.Delete',
  fields: ['email'],
}

// Throw an Error because you can't apply the option `email` to the `Delete` action
```

```ts
// Permission
{
  operation: 'User.Delete',
  alias: 'removeUser',
  fields: ['email'],
}

// Throw an Error because you can't apply the option `email` to the `Delete` action
```
<br>

### Model (will be available with the V2)
```ts
// Permission
{
  operation: 'User.*',
}

// Rule apply on
User { ... }
```

```ts
// Permission
{
  operation: 'User.*',
  fields: ['email'],
}

// Rule apply on
User { email }
```

```ts
// Permission
{
  operation: 'User.*',
  alias: 'removeUser',
}

// Throw an Error because you can't apply the option `alias` to the `*` action
```
