import {
  GraphQLSchema,
  FieldDefinitionNode,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
  print,
} from 'graphql'

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
