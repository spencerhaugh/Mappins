const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const PORT = process.env.PORT || 4000;

const { findOrCreateUser } = require('./controllers/userController');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log("DB Connected!"))
    .catch((err) => console.error(err));

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        let authToken = null;
        let currentUser = null;

        try {
            authToken = req.headers.authorization;
            if (authToken) {
                // find or create user if authenticated
                currentUser = await findOrCreateUser(authToken);
                return { authToken, currentUser }
            }
        } catch (err) {
            console.warn(`Unable to authenticate user with token ${authToken}`);
        }
        return { authToken: null, currentUser: null }
    }
});

const app = express();

const corsOptions = {
    // origin: process.env.FRONTEND_URL || '*',
    origin: '*',
    credentials: true,
}
server.applyMiddleware({ app, cors: corsOptions })

app.listen({ port: PORT || 4000 }, () => {
    console.log(`Server listening on ${PORT}`)
});