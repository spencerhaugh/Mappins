const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

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

const server = new ApolloServer ({
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
            }
        } catch (err) {
            console.error(`Unable to authenticate user with token ${authToken}`);
        }
        return { currentUser }
    }
});

server.listen().then(({ url }) => {
    console.log(`Server listening on ${url}`)
});