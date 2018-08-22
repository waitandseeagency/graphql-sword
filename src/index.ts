import { GraphQLSchema } from 'graphql'
import { middleware } from 'graphql-middleware'

import { validatePermissions } from './permissions'
import { defaultAuthenticatedRule } from './helpers'
import { IOptions, IPermission } from './types'

export { IPermission }

function normalizeOptions(options: IOptions = {}): IOptions {
  return {
    debug: options.debug !== undefined ? options.debug : false,
    authenticatedDefault:
      options.authenticatedDefault !== undefined
        ? options.authenticatedDefault
        : defaultAuthenticatedRule,
  }
}

export function permissions(
  permissionsRules: IPermission[],
  _options?: IOptions,
) {
  return middleware((schema: GraphQLSchema) => {
    const options = normalizeOptions(_options)
    return validatePermissions(schema, permissionsRules, options)
  })
}

// Exemple
// const permissionsSetup: Permission[] = [
//   {
//     operation: 'User.Read',
//     authenticated: true,
//     alias: 'me',
//   },
//   {
//     operation: 'User.Read',
//     authenticated: true,
//     fields: ['password', 'email'],
//     // rule: () => {},
//   },
//   {
//     operation: 'User.Browse',
//     authenticated: true,
//     alias: 'users',
//   },
//   {
//     operation: 'User.Edit',
//     authenticated: true,
//     alias: 'updateCurrentUser',
//     // fields: ['email'],
//     // rule: isOwner,
//   },
//   {
//     operation: 'UserSpace.Read',
//     authenticated: true,
//     fields: ['slug'],
//     // rule: () => { },
//     // query: ownerUserSpace,
//   },
//   {
//     operation: 'UserSpace.Browse',
//     authenticated: true,
//     alias: 'spaces',
//     // rule: () => { },
//     // query: ownerUserSpace,
//   },
//   {
//     operation: 'UserSpace.Add',
//     authenticated: true,
//   },
//   {
//     operation: 'UserSpace.Edit',
//     authenticated: true,
//     fields: ['slug'],
//     // rule: isOwner,
//     // query: ownerUserSpace,
//   },
//   {
//     operation: 'UserSpace.Delete',
//     authenticated: true,
//     // rule: isOwner,
//     // query: ownerUserSpace,
//   },
// ]
