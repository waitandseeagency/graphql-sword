import { GraphQLSchema } from 'graphql'
import { shield } from 'graphql-shield'
import * as pluralize from 'pluralize'

import { wrapRules } from './rules';
import { extractOperationsName, setObjectPath } from './helpers'
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
  return permissions.reduce(
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
        if (((fields && fields.length > 0) || true) && !acc[type]) {
          acc[type] = {}
        }

        let operationName: string
        let operationFullName: string
        let existInSchema: boolean = true

        switch (action) {
          case 'Browse': {
            // Query
            operationName = alias
              ? alias
              : pluralize(type.replace(/^\w/, c => c.toLowerCase()))
            operationFullName = `Query.${operationName}`
            existInSchema = Object.keys(schemaOperations.Query).some(
              (operation: string) => operation === operationName,
            )
            break
          }
          case 'Read': {
            // Query
            operationName = alias
              ? alias
              : type.replace(/^\w/, c => c.toLowerCase())
            operationFullName = `Query.${operationName}`;
            existInSchema = Object.keys(schemaOperations.Query).some(
              (operation: string) => operation === operationName,
            )
            break
          }
          case 'Edit': {
            // Mutation
            operationName = alias
              ? alias
              : `edit${type}`
            operationFullName = `Mutation.${operationName}`
            existInSchema = Object.keys(schemaOperations.Mutation).some(
              (operation: string) => operation === operationName,
            )
            break
          }
          case 'Add': {
            // Mutation
            operationName = alias
              ? alias
              : `add${type}`
            operationFullName = `Mutation.${operationName}`
            existInSchema = Object.keys(schemaOperations.Mutation).some(
              (operation: string) => operation === operationName,
            )
            break
          }
          case 'Delete': {
            // Mutation
            if (fields && fields.length > 0) {
              throw new Error(
                'Fields cannot be passed for the \`Delete\` action' +
                ` on the operation ${operation}`,
              )
            }

            operationName = alias
              ? alias
              : `delete${type}`
            operationFullName = `Mutation.${operationName}`
            existInSchema = Object.keys(schemaOperations.Mutation).some(
              (operation: string) => operation === operationName,
            )
            break
          }
          case '*': {
            operationFullName = type
            break
          }
          default: {
            throw new Error(
              `Wrong permission name, please verify the opertaion ${operation}`,
            )
          }
        }

        if (!existInSchema) {
          throw new Error(
            `No default resolver find for the operation ${operation}, ` +
            'verify your schema or add an alias on the permission',
          )
        }

        setObjectPath(
          acc,
          operationFullName,
          wrapRules(
            authenticated,
            options.authenticatedRule(),
            { query, fields, cache, action },
          ),
        )
      }

      return acc
    },
    { Query: {}, Mutation: {} },
  )
}
