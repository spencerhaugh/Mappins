import React, { useState, useEffect, useContext } from "react";
import ReactMapGL, { NavigationControl, Marker, Popup } from 'react-map-gl';
import { withStyles } from "@material-ui/core/styles";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useClient } from "../client";
import { differenceInMinutes } from 'date-fns';
import PinIcon from "./PinIcon";
import Blog from './Blog';
import Context from "../context";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

import { Subscription } from "react-apollo";
import { GET_PINS_QUERY } from "../graphql/queries";
import { DELETE_PIN_MUTATION } from "../graphql/mutations";
import { PIN_ADDED_SUBSCRIPTION, PIN_UPDATED_SUBSCRIPTION, PIN_DELETED_SUBSCRIPTION } from "../graphql/subscriptions";


const initialViewport = {
  latitude: 37.7577,
  longitude: -122.4376,
  zoom: 13
}

const Map = ({ classes }) => {
  
  const mobileSize = useMediaQuery('(max-width:650px)');
  const client = useClient();
  const { state, dispatch } = useContext(Context);
  
  // on mount get any existing pins
  useEffect(() => {
    getPins();
  }, []);
  
  const [viewport, setViewport] = useState(initialViewport);
  const [userPosition, setUserPostion] = useState(null);
  
  // on mount run get user position
  useEffect(() => {
    getUserPosition();
  }, []);

  // Set info for popup on pin click
  const [popup, setPopup] = useState(null)

  // Removes popup if pin is deleted by author while popup is open (Edge case)
  useEffect(() => {
    const pinExists = popup && state.pins.findIndex(pin => pin._id === popup._id) > -1; // true if popup and id of popup is found in pins
    if (!pinExists) {
      setPopup(null)
    }
  }, [state.pins.length]) 

  // Function: Get & set user location based on device
  const getUserPosition = () => {
    // get user position from window
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        // set viewport pos and user pos with latitude and longitude from navigator coords
        setViewport({...viewport, latitude, longitude});
        setUserPostion({ latitude, longitude });
      });
    }
  };

  // Function: Get any stored pins
  const getPins = async () => {
    const { getPins } = await client.request(GET_PINS_QUERY);
    dispatch({ type: "GET_PINS", payload: getPins });
  };

  // Add pins to map
  const handleMapClick = (evt) => {
    // click event data contains lnglat array w/ longitude and latitude, and with mouse button was clicked
    const { lngLat, leftButton } = evt;
    if (!leftButton) return; // only look for left mouse clicks
    if (!state.draft) {
      dispatch({ type: "CREATE_DRAFT" }); // if no draft in state, create one
    }
    setPopup(null);
    const [longitude, latitude] = lngLat; // pull coordinates from the lngLat info from event
    dispatch({ type: "UPDATE_DRAFT_LOCATION", payload: { longitude, latitude } }); // update draft location in state
  };

  // Highlight newest pins created
  const highlightNewPin = (pin) => {
    const isNewPin = differenceInMinutes(Date.now(), Number(pin.createdAt)) <= 1440; // New in the past 24hrs?
    return isNewPin ? "red" : "orange";
  };

  const handleSelectPin = (pin) => {
    setPopup(pin);
    dispatch({ type: "SET_PIN", payload: pin });
  };

  const isAuthUser = () => state.currentUser._id === popup.author._id;

  const handleDeletePin = async (pin) => {
    const variables = { pinId: pin._id }
    await client.request(DELETE_PIN_MUTATION, variables); // remove pin from DB
    setPopup(null);
  };

  const closePopup = () => {
    setPopup(null);
    dispatch({ type: "CLEAR_CURRENT_PIN", payload: null }) 
  }

  return (
    <div className={mobileSize ? classes.rootMobile : classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        scrollZoom={!mobileSize}
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
        <PinIcon size={30} color={'hotpink'} />
      </Marker>
      )}

        {/* Created Pins */}
        {state.pins.map(pin => (
          <Marker
            key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon 
              size={30} 
              color={highlightNewPin(pin)} 
              onClick={() => handleSelectPin(pin)}
            />
          </Marker>
        ))}

        {/* Popup Dialogue */}
        {popup && (
          <Popup
            anchor='top'
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            // onClose={() => setPopup(null)}
            onClose={() => closePopup()}
          >
            <img 
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title}
              />
              <div className={classes.popupTab}>
              <Typography gutterBottom>
                {popup.latitude.toFixed(6)}, {popup.longitude.toFixed(6)}
              </Typography>
              {isAuthUser() && (
                <Button onClick={() => handleDeletePin(popup)}>
                  <DeleteIcon className={classes.deleteIcon} /> Delete Pin
                </Button>
              )}

              </div>
          </Popup>
        )}

      </ReactMapGL>

      {/* Subscriptions for Creating/Updating/Deleting pins */}
                <Subscription
                  subscription={PIN_ADDED_SUBSCRIPTION}
                  onSubscriptionData={({ subscriptionData }) => {
                    const { pinAdded } = subscriptionData.data;
                    console.log("Pin added: ", pinAdded);
                    dispatch({ type: "CREATE_PIN", payload: pinAdded }); // Add to state 
                  }}
                />
                <Subscription
                  subscription={PIN_UPDATED_SUBSCRIPTION}
                  onSubscriptionData={({ subscriptionData }) => {
                    const { pinUpdated } = subscriptionData.data;
                    console.log("Pin updated: ", pinUpdated);
                    dispatch({ type: "CREATE_COMMENT", payload: pinUpdated }); // Add to state
                  }}
                />
                <Subscription
                  subscription={PIN_DELETED_SUBSCRIPTION}
                  onSubscriptionData={({ subscriptionData }) => {
                    const { pinDeleted } = subscriptionData.data;
                    console.log("Pin deleted: ", pinDeleted);
                    dispatch({ type: "DELETE_PIN", payload: pinDeleted }); // Remove from state
                  }}
                />

      {/* Blog Area to add dropped pin content */}
      <Blog />
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
