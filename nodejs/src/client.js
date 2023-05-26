const { GraphQLClient } = require('graphql-request');

//  http://host.docker.internal:9000 is for MacOS and Windows
//  Use http://localhost:9000 for Linux
const client = new GraphQLClient('http://host.docker.internal:8080/v1/graphql', {
    headers: { 'x-hasura-admin-secret': 'myadminsecretkey' },
});

module.exports = client