const GraphQLUpload = {
  name: 'Upload',
  description: 'Mock GraphQL Upload scalar for testing',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast.value,
};

module.exports = GraphQLUpload;
