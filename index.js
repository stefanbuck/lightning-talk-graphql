const express = require("express");
const bodyParser = require("body-parser");
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const { makeExecutableSchema } = require("graphql-tools");
const _ = require("lodash");

const users = [
  { id: 1, name: "Harry", role: "ADMIN" },
  { id: 2, name: "John", role: "REGULAR" },
  { id: 3, name: "Charles", role: "REGULAR" }
];

const typeDefs = `
  type Query {
    users: [User]
    user(id :Int!): User
    filterByRole(role :UserRole!): [User]
  }

  type User {
    id: Int
    name: String
    slackname: String
    role: UserRole
  }

  enum UserRole {
    ADMIN
    REGULAR
  }
`;

const fetchSlackName = id =>
  new Promise((resolve, reject) => {
    const user = _.find(users, { id });
    resolve(`_${user.name.toUpperCase()}`);
  });

const resolvers = {
  Query: {
    users: () => {
      return users;
    },
    user: (obj, args, context) => {
      return _.find(users, { id: args.id });
    },
    filterByRole: (obj, args, context) => {
      return _.filter(users, { role: args.role });
    }
  },
  User: {
    slackname(user) {
      return fetchSlackName(user.id);
    }
  }
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use("/", graphiqlExpress({ endpointURL: "/graphql" }));

// Start the server
app.listen(3000, () => {
  console.log("Go to http://localhost:3000/graphiql to run queries!");
});
