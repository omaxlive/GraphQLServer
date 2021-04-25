const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

// Connect DB
connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    console.log('headers: ', req.headers);
    const token = req.headers['authorization'] || '';
    if (token) {
      try {
        const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET);
        // console.log(usuario);
        return {
          user,
        };
      } catch (error) {
        console.log('Something went wrong');
        console.log(error);
      }
    }
  },
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server ready in the URL ${url}`);
});
