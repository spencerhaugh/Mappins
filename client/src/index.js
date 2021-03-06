import React, { useContext, useReducer } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import App from "./pages/App";
import Splash from "./pages/Splash";
import Context from "./context";
import reducer from "./reducer";

import "mapbox-gl/dist/mapbox-gl.css";
import * as serviceWorker from "./serviceWorker";

// Apollo provider for Subscribe websocket live updating
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from 'apollo-cache-inmemory';

// Websocket Link
const wsLink = new WebSocketLink({
  // testing/local uri
  // uri: 'ws://localhost:4000/graphql',
  // Deployment uri
  uri: 'wss://mappins-app.herokuapp.com/graphql',
  options: {
    reconnect: true
  }
});
// Apollo Client
const client = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache()
})

const Root = () => {

  const initialState = useContext(Context);
  const [state, dispatch] = useReducer(reducer, initialState)

  console.log(state)

  return (
    <Router>
      <ApolloProvider client={client}>
        <Context.Provider value={{ state, dispatch }}>
          <Switch>
            <ProtectedRoute exact path="/" component={App} />
            <Route path="/login" component={Splash} />
          </Switch>
        </Context.Provider>
      </ApolloProvider>
    </Router>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
