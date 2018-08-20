import { ApolloError } from 'apollo-server-errors'
import { and, Rule, LogicRule, rule } from 'graphql-shield'
import { ICacheOptions } from 'graphql-shield/dist/types'

import { PermissionRule } from './types'

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

export const defaultAuthenticatedRule: PermissionRule = (
  { cache } : { cache: ICacheOptions } = { cache: 'contextual' },
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
