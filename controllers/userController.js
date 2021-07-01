const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const { createSourceEventStream } = require('graphql');

const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);


exports.findOrCreateUser = async (token) => {
    // verify authToken
    const googleUser = await verifyAuthToken(token);
    
    // check if user exists
    const user = await checkIfUserExists(googleUser.email);
    
    // return user or create new user in DB
    return user ? user : createNewUser(googleUser);
}

// Verify Google Auth
const verifyAuthToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.OAUTH_CLIENT_ID
        })
        return ticket.getPayload();
    } catch (err) {
        console.error("Error verifying Auth Token", err)
    }
}

// Check for googleUser in DB
const checkIfUserExists = async (email) => await User.findOne({ email }).exec();

// Create new user in DB
const createNewUser = (googleUser) => {
    const { name, email, picture } = googleUser; // Pull googleUser info
    const user = { name, email, picture }; // build user object to match our schema

    return new User(user).save(); // save user object to DB
}