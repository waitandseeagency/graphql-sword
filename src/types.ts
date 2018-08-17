import { Rule } from 'graphql-shield'
import { ICacheOptions } from 'graphql-shield/dist/types'

export interface Permission {
  operation: string
  alias?: string
  authenticated?: boolean
  fields?: string[]
  rule?: PermissionRule,
  query?: PermissionQuery,
}

export interface PermissionRule {
  (
    args?: PermissionArgs,
  ): Rule
}

export interface PermissionArgs {
  query ?: PermissionQuery,
  fields ?: string[],
  cache ?: ICacheOptions,
}

export type PermissionQuery = (ctx: any, T: any) => void | any

export interface Options {
  debug: boolean
  authenticatedDefault: PermissionRule
}
