import { ApolloError } from 'apollo-server-errors'

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

export class AuthorizationError extends ApolloError {
  constructor(
    message: string = 'Not authorized.',
    properties?: Record<any, any>,
  ) {
    super(message, 'UNAUTHORIZED', properties)
    Object.defineProperty(this, 'name', { value: 'AuthorizationError' })
  }
}
