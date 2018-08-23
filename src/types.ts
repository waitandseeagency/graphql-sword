import { Rule } from 'graphql-shield'
import { ICacheOptions } from 'graphql-shield/dist/types'

export type IAction = 'Browse' | 'Read' | 'Edit' | 'Add' | 'Delete' | '*'
export type ICache = ICacheOptions

export interface IPermission {
  operation: string
  authenticated?: boolean
  alias?: string // TODO: v1.2 string | string[]
  fields?: string[]
  query?: IPermissionQuery
  cache?: ICacheOptions
  // exception?: string[] // TODO: v2
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

export type IPermissionQuery = (ctx: any, T: any) => Promise<boolean>

export interface IOptions {
  debug?: boolean
  authenticatedRule?: IPermissionRule
}

export interface IOperations {
  Query: { [key: string]: any }
  Mutation: { [key: string]: any }
  [key: string]: any
}
