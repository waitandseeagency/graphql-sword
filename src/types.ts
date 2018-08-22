import { Rule } from 'graphql-shield'
import { ICacheOptions } from 'graphql-shield/dist/types'

export type IAction = 'Browse' | 'Read' | 'Edit' | 'Add' | 'Delete' | '*'
export type ICache = ICacheOptions

export interface IPermission {
  operation: string
  authenticated?: boolean
  alias?: string // TODO v2 string | string[]
  fields?: string[]
  rule?: IPermissionRule
  query?: IPermissionQuery
  cache?: ICacheOptions
}

export interface IPermissionRule {
  (
    args?: IPermissionArgs,
  ): Rule
}

export interface IPermissionArgs {
  query?: IPermissionQuery
  fields?: string[]
  cache?: ICacheOptions
  action?: IAction
}

export type IPermissionQuery = (ctx: any, T: any) => void | any

export interface IOptions {
  debug?: boolean
  authenticatedDefault?: IPermissionRule
}

export interface IOperations {
  Query: { [key: string]: any }
  Mutation: { [key: string]: any }
  [key: string]: any
}
