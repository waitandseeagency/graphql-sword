import { GraphQLResolveInfo } from 'graphql'
import { and, rule, Rule, LogicRule } from 'graphql-shield'

import { parseOperationFieldsFromAST } from './helpers'
import { AuthenticationError, AuthorizationError } from './errors'
import { IPermissionRule, ICache, IPermissionArgs } from './types'

export const defaultAuthenticatedRule: IPermissionRule = (
  { cache }: { cache: ICache } = { cache: 'contextual' },
): Rule =>
  rule({
    cache,
  })(async (_, args, ctx) => {
    const user = ctx.user
    if (!user || !user.id) {
      throw new AuthenticationError()
    }
    return true
  })

const defaultRule: IPermissionRule = (
  // { cache }: { cache: ICache } = { cache: 'strict' },
  { query, fields, cache, action }: IPermissionArgs =
  { cache: 'strict' },
): Rule =>
  rule({
    cache,
    // TODO: v1.2 add fragment here for id on requested type
  })(async (parent, args, ctx, info: GraphQLResolveInfo) => {
    // Allow rule if not specific condition are provided
    if (!query && (!fields || !fields.length)) {
      return true
    }
    // Check if specific fields are to protect
    if (fields && fields.length) {
      // TODO: check the action to know if fields to verify
      // TODO: are in the input or output

      // TODO: wait for fragment if Model need to be examined!
      // This solution allow to parse all field existing
      // But it can generate conflict between fields from differents types
      // which have the same name
      // const selection = ['Query', 'Mutation'].includes(info.parentType.name)
      //   ? print(info.fieldNodes[0].selectionSet)
      //   : parent && Object.keys(parent).join(' ')
      // //   : print(info.fieldNodes[0])

      // const result = fields.some(
      //   field => selection.indexOf(field) >= 0,
      // )

      // Get and parse top level fields requested
      const fieldsCalled = parseOperationFieldsFromAST(info.operation)
      const requestResult = fields.some(
        field => fieldsCalled.includes(field),
      )

      if (!requestResult) {
        return true
      }
    }
    // If fields are checked or not provided
    // Approve the user's authorization
    if (query) {
      const returnType = (
        ['Query', 'Mutation'].includes(info.parentType.name)
          ? info.returnType
          : info.parentType
      ).toString().replace(/!/g, '')

      const { id: requestId } =
        parent
          ? parent.id
            ? parent
            : { id: null }
          : args && args.where
            ? args.where
            : { id: null }

      const { id: userId = null } = ctx.user || ctx.req.user

      const isAllowed =
        returnType === 'User'
          ? requestId === userId
          : await query(ctx, requestId)

      if (isAllowed) {
        return true
      }
    }

    throw new AuthorizationError()
  })

export const wrapRules = (
  authenticated: boolean,
  authenticatedRule: Rule,
  args: IPermissionArgs,
): LogicRule | Rule => {
  if (args.query || (args.fields && args.fields.length)) {
    return authenticated
      ? and(authenticatedRule, defaultRule(args))
      : defaultRule(args)
  }
  return authenticatedRule
}
