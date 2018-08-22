import { ApolloError } from 'apollo-server-errors'
import { Rule, rule, LogicRule, and } from 'graphql-shield'
import {
  GraphQLSchema,
  FieldDefinitionNode,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
  print,
} from 'graphql'

import { IPermissionRule, ICache } from './types'

// Extends default Apollo error
export class AuthenticationError extends ApolloError {
  constructor(
    message: string = 'Not authenticated.',
    properties?: Record<any, any>,
  ) {
    super(message, 'UNAUTHENTICATED', properties)
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' })
  }
}

export const defaultAuthenticatedRule: IPermissionRule = (
  { cache }: { cache: ICache } = { cache: 'contextual' },
): Rule =>
  rule({
    cache,
  })(async (_, args, ctx) => {
    const user = ctx.user || ctx.req.user
    if (!user || !user.id) {
      throw new AuthenticationError()
    }
    return true
  })

export const checkAuthenticated = (
  authenticated: boolean,
  isAuthenticated: Rule,
  rule: Rule,
): LogicRule | Rule => {
  if (authenticated) {
    return and(isAuthenticated, rule)
  }
  return rule
}

export const parseOperationFieldsFromAST = (
  operation: OperationDefinitionNode,
) => {
  return operation.selectionSet.selections.reduce(
    // first level is field result name (aka query name)
    (acc, selection: SelectionNode) => {
      if (selection.kind === 'Field') {
        selection.selectionSet.selections.forEach(
          // second level is for get names of fields asked
          (topLevel: SelectionNode) => {
            if (topLevel.kind === 'Field') {
              acc.push(topLevel.name.value)
              // third level will be for sub-fields for relation (or list)
            }
          },
        )
      }

      return acc
    },
    [],
  )
}

export const extractOperationsName = (schema: GraphQLSchema) => {
  return Object.keys(schema.getTypeMap()).reduce(
    (acc, type: string) => {
      if (type === 'Query' || type === 'Mutation') {
        const typeDef = schema.getType(type)
        if (typeDef.astNode.kind === Kind.OBJECT_TYPE_DEFINITION) {
          typeDef.astNode.fields.forEach((field: FieldDefinitionNode) => {
            acc[type][field.name.value] = print(field.type)
          })
        }
      }
      return acc
    },
    { Query: {}, Mutation: {} },
  )
}

// https://stackoverflow.com/a/43849204
export const setObjectPath = (object, path: string, value) => path
  .split('.')
  .reduce(
    (o, p) => {
      return o[p] = path.split('.').pop() === p
        ? value
        : o[p] || {}
    },
    object,
  )
