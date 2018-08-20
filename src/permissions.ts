import { GraphQLSchema } from 'graphql'
import { shield, Rule, allow } from 'graphql-shield'
import pluralize from 'pluralize'

import { Permission, Options } from './types'
import { checkAuthenticated } from './utils'

const extractPermissions = (permissions: Permission[], options: Options) => {
  return permissions.reduce(
    (acc, permission) => {
      const {
        operation,
        alias = '',
        authenticated = false,
        rule = (T: any): Rule => allow,
        fields = [],
        query = (): void => {},
        cache = 'contextual',
      } = permission

      if (!authenticated && !alias && !fields.length && !permission.rule) {
        throw new Error(
          'A permission requires at least one permission, alias' +
            ` or fields args for operation ${operation}`,
        )
      }

      // Validate the operation type
      const regex = /(.*)\.(Read|Browse|Edit|Add|Delete)/
      const operationRule = operation.match(regex)

      if (!operationRule) {
        throw new Error(
          `Wrong permission name, please verify the opertaion ${operation}`,
        )
      }

      const type: string = operationRule[1]
      if (fields && fields.length > 0 && !acc[type]) {
        acc[type] = {}
      }

      switch (operationRule[2]) {
        case 'Read': {
          // Query
          const operationName = alias ? alias : type.toLowerCase()
          acc.Query[operationName] = checkAuthenticated(
            authenticated,
            options.authenticatedDefault(),
            rule({ query, fields }),
          )
          break
        }
        case 'Browse': {
          // Query
          // TODO add pluralize package
          const operationName = alias ? alias : pluralize(type.toLowerCase())
          acc.Query[operationName] = checkAuthenticated(
            authenticated,
            options.authenticatedDefault(),
            rule({ query, cache: 'strict' }),
          )
          break
        }
        case 'Edit': {
          // Mutation
          const operationName = alias ? alias : `update${type}`
          acc.Mutation[operationName] = checkAuthenticated(
            authenticated,
            options.authenticatedDefault(),
            rule({ query, fields, cache }),
          )
          break
        }
        case 'Add': {
          // Mutation
          const operationName = alias ? alias : `create${type}`
          acc.Mutation[operationName] = checkAuthenticated(
            authenticated,
            options.authenticatedDefault(),
            rule({ query, fields, cache }),
          )
          break
        }
        case 'Delete': {
          // Mutation
          const operationName = alias ? alias : `delete${type}`
          acc.Mutation[operationName] = checkAuthenticated(
            authenticated,
            options.authenticatedDefault(),
            rule({ query, fields, cache }),
          )
          break
        }
      }

      return acc
    },
    { Query: {}, Mutation: {} },
  )
}

export const validatePermissions = (
  schema: GraphQLSchema,
  permissions: Permission[],
  options: Options,
) => {
  return shield(extractPermissions(permissions, options), {
    allowExternalErrors: true,
  })
}
