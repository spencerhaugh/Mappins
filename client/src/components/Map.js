import React, { useState, useEffect, useContext } from "react";
import ReactMapGL, { NavigationControl, Marker } from 'react-map-gl';
import { withStyles } from "@material-ui/core/styles";
import PinIcon from "./PinIcon";
import Context from "../context";
// import Button from "@material-ui/core/Button";
// import Typography from "@material-ui/core/Typography";
// import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

const initialViewport = {
  latitude: 37.7577,
  longitude: -122.4376,
  zoom: 13
}

const Map = ({ classes }) => {
  const { state, dispatch } = useContext(Context);
  const [viewport, setViewport] = useState(initialViewport);
  const [userPosition, setUserPostion] = useState(null);

  // on mount run get user position
  useEffect(() => {
    console.log("using effect...")
    getUserPosition();
  }, []);

  // Get & set user location based on device
  const getUserPosition = () => {
    console.log("getting user position...")
    // get user position from window
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        console.log("Position fund: ", longitude, latitude)
        // set viewport pos and user pos with latitude and longitude from navigator coords
        setViewport({...viewport, latitude, longitude});
        setUserPostion({ latitude, longitude });
      });
    }
  };

  // Add pins to map
  const handleMapClick = (evt) => {
    // click event data contains lnglat array w/ longitude and latitude, and with mouse button was clicked
    const { lngLat, leftButton } = evt;
    if (!leftButton) return; // only look for left mouse clicks
    if (!state.draft) {
      dispatch({ type: "CREATE_DRAFT" }); // if no draft in state, create one
    }
    const [longitude, latitude] = lngLat; // pull coordinates from the lngLat info from event
    dispatch({ type: "UPDATE_DRAFT_LOCATION", payload: { longitude, latitude } }); // update draft location in state
  };

  return (
    <div className={classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken="pk.eyJ1Ijoic3BlbmNlcmhhdWdoIiwiYSI6ImNrcWw4cnVuMjAybm0ybnE0dGR1dnd2eXAifQ.00jDcQastThwnM6QKzy7OQ"
        onViewportChange={newViewport => setViewport(newViewport)}
        onClick={handleMapClick}
        {...viewport}
      >
        {/* Navigation Control (zoom in/out buttons) */}
        <div className={classes.navigationControl}>
          <NavigationControl onViewportChange={newViewport => setViewport(newViewport)} />
        </div>

      {/* Pin for user current position */}
      {userPosition && (
        <Marker
          latitude={userPosition.latitude}
          longitude={userPosition.longitude}
          offsetLeft={-19}
          offsetTop={-37}
        >
          <PinIcon size={40} color={'#ba68c8'} />
        </Marker>
      )}
      {/* Draft Pin */}
      {state.draft && (
        <Marker
        latitude={state.draft.latitude}
        longitude={state.draft.longitude}
        offsetLeft={-19}
        offsetTop={-37}
      >
        <PinIcon size={40} color={'hotpink'} />
      </Marker>
      )}

      </ReactMapGL>

    </div>
  )
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
