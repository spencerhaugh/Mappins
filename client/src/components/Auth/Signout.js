import React, { useContext } from "react";
import { GoogleLogout } from 'react-google-login'
import { withStyles } from "@material-ui/core/styles";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ExitToApp from "@material-ui/icons/ExitToApp";
import Typography from "@material-ui/core/Typography";

import Context from "../../context";

const Signout = ({ classes }) => {

  const mobileSize = useMediaQuery('(max-width: 650px)');

  const { dispatch } = useContext(Context);

  const onSignout = () => {
    dispatch({ type: "SIGNOUT_USER" });
    console.log("Signed out user");
  }

  return (
    <GoogleLogout
      onLogoutSuccess={onSignout}
      buttonText='Signout'
      // rendering a custom button
      render={ ({ onClick }) => (
        <span className={classes.root} onClick={onClick}>
          <Typography
            variant='body1'
            style={{display: mobileSize ? "none" : "block"}}
            className={classes.buttonText}
          >
            Signout
          </Typography>
          <ExitToApp className={classes.buttonIcon} />
        </span>
      )}
    />
  )
};

const styles = {
  root: {
    cursor: "pointer",
    display: "flex"
  },
  buttonText: {
    color: "lightgreen"
  },
  buttonIcon: {
    marginLeft: "5px",
    color: "lightgreen"
  }
};

export default withStyles(styles)(Signout);
