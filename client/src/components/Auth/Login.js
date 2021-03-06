import React, { useContext } from "react";
import { GraphQLClient } from 'graphql-request';
import { GoogleLogin } from 'react-google-login';
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from '@material-ui/core/useMediaQuery';


import Context from "../../context";
import { ME_QUERY } from "../../graphql/queries";
import { BASE_URL } from "../../client";


const Login = ({ classes }) => {

  const mobileSize = useMediaQuery('(max-width:650px)');

  const { dispatch } = useContext(Context)

  const onSuccess = async (googleUser) => {
    try {
      const idToken = googleUser.getAuthResponse().id_token
      console.log({ idToken });
      // Send idToken to backend
      const client = new GraphQLClient(BASE_URL, {
        headers: { authorization: idToken }
      });
      console.log("Sending to auth headers GraphQL...")
      // Receive data from DB with user data
      const data = client.request(ME_QUERY); // ME_QUERY imported from gql queries file
      console.log("ME QUERY: ", { data });

      // Update state with current user, and add isAuth: true
      dispatch({ type: "LOGIN_USER", payload: data.me });
      dispatch({ type: "IS_LOGGED_IN", payload: true }); // could pass in 'true',
      // dispatch({ type: "IS_LOGGED_IN", payload: googleUser.isSignedIn() }); // could pass in 'true', but googleUser method isSignedIn is more reliable
    } catch (err) {
      onFailure(err)
    }
  };


  const onFailure = (err) => {
    console.error("Error logging in: ", err)
    dispatch({ type: "IS_LOGGED_IN", payload: false }); // if error logging in (expired token), dispatch false to prevent loop of sign in attempts
  }

  return (
    <div className={classes.root}>
      <img src={mobileSize ? 'logo192.png' : 'logo512.png'} alt="Mappins Logo" />
      <Typography
        component='h1'
        variant='h4'
        gutterBottom
        noWrap
        style={{ color: "rgb(66,133,244)" }}
      >
        Welcome to Mappins
      </Typography>
      <GoogleLogin
        clientId='774529361772-auucjid5grqlj7bhkl54jdmrgbriapj2.apps.googleusercontent.com'
        onSuccess={onSuccess}
        onFailure={onFailure}
        isSignedIn={true} // keeps user logged in
        cookiePolicy={'single_host_origin'}
        theme='dark'
        buttonText='Login with Google'
      />
    </div>
  )
};

const styles = {
  root: {
    height: "100vh",
    width: "90vw",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
