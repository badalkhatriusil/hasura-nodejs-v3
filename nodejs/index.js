// const { gql } = require("graphql-request");
const client = require("./src/client");
const { generateJWT } = require("./src/jwt");
const express = require("express");
const { ApolloServer, gql } = require("apollo-server");

const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

const ObjectScalarType = new GraphQLScalarType({
  name: "Object",
  description: "Arbitrary object",
  parseValue: (value) => {
    return typeof value === "object"
      ? value
      : typeof value === "string"
      ? JSON.parse(value)
      : null;
  },
  serialize: (value) => {
    return typeof value === "object"
      ? value
      : typeof value === "string"
      ? JSON.parse(value)
      : null;
  },
  parseLiteral: (ast) => {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        throw new Error(`Not sure what to do with OBJECT for ObjectScalarType`);
      default:
        return null;
    }
  }
});

const typeDefs = gql`
  scalar Object

  type AuthResponse {
    token: String
  }
  type Mutation {
    login(username: String!, password: String!): AuthResponse
  }
  type Query {
    hello: String
    findNearbyUsers(
      userId: String!
      distance_kms: Int!
    ): Object
  }
`;
const resolvers = {
  Object: ObjectScalarType,
  Query: {
    hello: () => "Hello GraphQL world!👋",
    findNearbyUsers: findNearbyUsers
  },
  Mutation: {
    login: login
  }
};

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON in request bodies
// app.use(express.json());

// app.listen(port, () => {
//   console.log(`Auth server running on port ${port}.`);
// });

const server = new ApolloServer({ typeDefs, resolvers });
server
  .listen({ port: 9000 })
  .then((serverInfo) => console.log(`Server running at ${serverInfo.url}`));

async function login(parent, args, contextValue, info) {
  if (args && (args?.username !== "admin" || args?.password !== "admin")) {
    // NOTE: THIS IS JUST FOR DEMO! NEED TO HANDLE ERROR PROPERLY.
    return {
      token: "INVALID"
    };
  }

  let { user } = await client.request(
    gql`
      query getUserByname {
        user {
          id
        }
      }
    `,
    {}
  );

  // Since we filtered on a non-primary key we got an array back
  user = user[0];

  if (!user) {
    return {
      token: "INVALID"
    };
  }

  return {
    token: generateJWT({
      defaultRole: "user", // NOTE: STATIC user ROLE FOR THIS DEMO
      allowedRoles: ["user"], // NOTE: STATIC user ROLE FOR THIS DEMO
      otherClaims: {
        "X-Hasura-User-Id": user.id
      }
    })
  };
}

async function findNearbyUsers(parent, args, contextValue, info) {
  // Hasura Query
  const query = gql`
  query nearby_user($distance_kms: Int!, $userId: uuid!) {
    nearby_user(args: {distance_kms: $distance_kms, userid: $userId}) {
      user_id
      first_name
      last_name
      gender
      lat
      long
    }
  }
  
  
  `;

  // Variables needed for Hasura query
  const variables = {
    
      "userId": args.userId,
      "distance_kms": args.distance_kms
    
    
    
  };
  let data = await client.request(query, variables);

  return data.nearby_user;
}
