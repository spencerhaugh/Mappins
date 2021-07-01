import React from "react";
import { GraphQLClient } from 'graphql-request';
import { GoogleLogin } from 'react-google-login';
import { withStyles } from "@material-ui/core/styles";
// import Typography from "@material-ui/core/Typography";


// GraphQL query string to req user data from server
const ME_QUERY = `
{
  me {
    name
    email
    picture
    _id
  }
}
`

const Login = ({ classes }) => {



  const onSuccess = async (googleUser) => {
    const idToken = googleUser.getAuthResponse().id_token
    console.log({idToken});
    // Send idToken to backend
    const client = new GraphQLClient("http://localhost:4000/graphql", {
      headers: { authorization: idToken }
    });
    const data = await client.request(ME_QUERY);
    console.log({data})
  };

  return (
    <GoogleLogin 
      clientId='774529361772-auucjid5grqlj7bhkl54jdmrgbriapj2.apps.googleusercontent.com' 
      onSuccess={onSuccess}
      isSignedIn={true} // keeps user logged in
    />
    )
};

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
