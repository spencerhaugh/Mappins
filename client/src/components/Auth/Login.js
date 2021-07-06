import React, { useContext } from "react";
import { GraphQLClient } from 'graphql-request';
import { GoogleLogin } from 'react-google-login';
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";


import Context from "../../context";
import { ME_QUERY } from "../../graphql/queries";
import { BASE_URL } from "../../client";


const Login = ({ classes }) => {

  const { dispatch } = useContext(Context)

  const onSuccess = async (googleUser) => {
    try {
      const idToken = googleUser.getAuthResponse().id_token
      console.log({idToken});
      // Send idToken to backend
      const client = new GraphQLClient(BASE_URL, {
        headers: { authorization: idToken }
      });
      // Receive data from DB with user data
      const data = await client.request(ME_QUERY); // ME_QUERY imported from gql queries file
      // console.log({data});

      // Update state with current user, and add isAuth: true
      dispatch({ type: "LOGIN_USER", payload: data.me });
      dispatch({ type: "IS_LOGGED_IN", payload: googleUser.isSignedIn() }); // could pass in 'true', but googleUser method isSignedIn is more reliable
    } catch (err) {
      onFailure(err)
    }
  };


  const onFailure = (err) => {
    console.error("Error logging in: ", err)
  }

  return (
    <div className={classes.root}>
      <Typography
        component='h1'
        variant='h3'
        gutterBottom
        noWrap
        style={{ color: "rgb(66,133,244)" }}
      >
        Welcome
      </Typography>
      <GoogleLogin 
        clientId='774529361772-auucjid5grqlj7bhkl54jdmrgbriapj2.apps.googleusercontent.com' 
        onSuccess={onSuccess}
        onFailure={onFailure}
        isSignedIn={true} // keeps user logged in
        theme='dark'
        buttonText='Login with Google'
      />
    </div>
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
