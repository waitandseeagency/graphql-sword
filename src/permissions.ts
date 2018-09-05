import { GraphQLSchema } from 'graphql'
import { shield, or } from 'graphql-shield'
import * as pluralize from 'pluralize'

import { wrapRules } from './rules';
import { extractOperationsName } from './helpers'
import { IPermission, IOperations, IOptions } from './types'

export const validatePermissions = (
  schema: GraphQLSchema,
  permissions: IPermission[],
  options: IOptions,
) => {
  return shield(
    extractPermissions(
      permissions,
      extractOperationsName(schema),
      options,
    ),
    {
      debug: options.debug,
      allowExternalErrors: true,
    },
  )
}

const extractPermissions = (
  permissions: IPermission[],
  schemaOperations: IOperations,
  options: IOptions,
) => {
  const operations = permissions.reduce(
    (acc: IOperations, permissionConfig: IPermission) => {
      const {
        operation,
        alias = '',
        authenticated = false,
        fields = [],
        // rule, // = (T: any): Rule => allow,
        query, // = (): void => {},
        cache = 'strict',
      } = permissionConfig

      if (
        !authenticated &&
        !alias &&
        !fields.length &&
        !query
      ) {
        throw new Error(
          'A permission requires at least one permission, alias' +
            ` or fields args for operation ${operation}`,
        )
      }

      // TODO: v1.2 authorize CRUD naming
      // const regex = /(.*)\.(Create|Read|Update|Delete|\*)/

      // Validate the operation type
      const regex = /(.*)\.(Browse|Read|Edit|Add|Delete|\*)/
      const operationRule = operation.match(regex)

      if (!operationRule) {
        throw new Error(
          `Wrong permission name, please verify the opertaion ${operation}`,
        )
      }

      const [/* complete regex */, type, action] = operationRule

      if (type === 'Query' || type === 'Mutation') {
        if (action !== 'Browse' || !alias) {
          throw new Error(
            `The operation ${operation} must use \`Browse\` as action ` +
            'and specify at least one alias',
          )
        }
      } else {
        // TODO: v1.1 Reformat init model rule
        // if (((fields && fields.length > 0) || true) && !acc[type]) {
        //   acc[type] = {} || []
        // }

        let operationType: string
        let operationName: string

        switch (action) {
          case 'Browse': {
            operationType = 'Query'
            operationName = alias
              ? alias
              : pluralize(type.replace(/^\w/, c => c.toLowerCase()))

            break
          }
          case 'Read': {
            operationType = 'Query'
            operationName = alias
              ? alias
              : type.replace(/^\w/, c => c.toLowerCase())

            break
          }
          case 'Edit': {
            operationType = 'Mutation'
            operationName = alias
              ? alias
              : `edit${type}`

            break
          }
          case 'Add': {
            operationType = 'Mutation'
            operationName = alias
              ? alias
              : `add${type}`

            break
          }
          case 'Delete': {
            if (fields && fields.length > 0) {
              throw new Error(
                'Fields cannot be passed for the \`Delete\` action' +
                ` on the operation ${operation}`,
              )
            }

            operationType = 'Mutation'
            operationName = alias
              ? alias
              : `delete${type}`

            break
          }
          case '*': {
            operationType = type
            break
          }
          default: {
            throw new Error(
              `Wrong permission name, please verify the opertaion ${operation}`,
            )
          }
        }

        if (operationName) {
          const operationExistInSchema: boolean = Object
            .keys(schemaOperations[operationType])
            .some((operation: string) => operation === operationName)

          if (!operationExistInSchema) {
            throw new Error(
              `No default resolver find for the operation ${operation}, ` +
              'verify your schema or add an alias on the permission',
            )
          }

          if (!acc[operationType][operationName]) {
            acc[operationType][operationName] = []
          }

          acc[operationType][operationName].push(
            wrapRules(
              authenticated,
              options.authenticatedRule(),
              { query, fields, cache, action },
            ),
          )
        }
      }

      return acc
    },
    { Query: {}, Mutation: {} },
  )

  return Object.keys(operations).reduce(
    (acc: IOperations, key: string) => {
      if (key === 'Query' || key === 'Mutation') {
        acc[key] = Object.keys(operations[key]).reduce(
          (queries, name) => {
            queries[name] = operations[key][name].length > 1
              ? or(...operations[key][name])
              : operations[key][name][0]

            return queries
          },
          {},
        )
      }

      if (Array.isArray(operations[key])) {
        acc[key] = or(...operations[key])
      }

      return acc
    },
    {},
  )
}
