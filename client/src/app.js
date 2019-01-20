/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createHttpLink } from 'apollo-link-http';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { ReduxCache, apolloReducer } from 'apollo-cache-redux';
// import { InMemoryCache } from 'apollo-cache-inmemory';
import ReduxLink from 'apollo-link-redux';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { persistStore, persistCombineReducers } from 'redux-persist';
import thunk from 'redux-thunk';
import { setContext } from 'apollo-link-context';
import _ from 'lodash';

import AppWithNavigationState, { navigationReducer, navigationMiddleware } from './navigation';
import auth from './reducers/auth.reducer';
import { logout } from './actions/auth.actions';

const URL = '10.0.2.2:8080'; // set your comp's url here
// const URL = 'localhost:8080';
const config = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['nav', 'apollo'], // don't persist nav for now
};

const reducer = persistCombineReducers(config, {
  apollo: apolloReducer,
  nav: navigationReducer,
  auth,
});

const store = createStore(
  reducer,
  {}, // initial state
  composeWithDevTools(
    applyMiddleware(thunk, navigationMiddleware),
  ),
);

// persistent storage
const persistor = persistStore(store);

const cache = new ReduxCache({ store });
// const cache = new InMemoryCache();

const reduxLink = new ReduxLink(store);

const httpLink = createHttpLink({ uri: `http://${URL}/graphql` });

// middleware for requests
const middlewareLink = setContext((req, previousContext) => {
  // get the authentication token from local storage if it exists
  const { jwt } = store.getState().auth;
  if (jwt) {
    return {
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    };
  }
  return previousContext;
});

// const errorLink = onError((errors) => {
//   console.log(errors);
// });

// afterware for responses
const errorLink = onError(({ graphQLErrors, networkError }) => {
  let shouldLogout = false;
  if (graphQLErrors) {
    console.log({ graphQLErrors });

    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log({ message, locations, path });
      if (message === 'Unauthorized') {
        shouldLogout = true;
      }
    });

    if (shouldLogout) {
      store.dispatch(logout());
    }
  }

  if (networkError) {
    console.log('[Network error]:');
    console.log({ networkError });

    if (networkError.statusCode === 401) {
      logout();
    }
  }
});

// Create WebSocket client
export const wsClient = new SubscriptionClient(`ws://${URL}/graphql`, {
  lazy: true,
  reconnect: true,
  connectionParams() {
    // get the authentication token from local storage if it exists
    return { jwt: store.getState().auth.jwt };
  },
});

const webSocketLink = new WebSocketLink(wsClient);

const requestLink = ({ queryOrMutationLink, subscriptionLink }) =>
  ApolloLink.split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    subscriptionLink,
    queryOrMutationLink,
  );

const link = ApolloLink.from([
  reduxLink,
  errorLink,
  requestLink({
    queryOrMutationLink: middlewareLink.concat(httpLink),
    subscriptionLink: webSocketLink,
  }),
]);

// const link = new ApolloLink.from([
//   onError(({ graphQLErrors, networkError, operation, response }) => {
//     // if (graphQLErrors) {
// 		// 	// graphQLErrors.map(({ message, locations, path }) =>
// 		// 	//   console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
// 		// 	// )
// 		// }
// 		// if (networkError) {
// 		//   console.log(`[Network error]: ${networkError}`)
// 		// }
//     return response;
//   }),
//   new HttpLink({
//     // credentials: 'same-origin', // Send the cookie along with every request
//     uri: `http://${URL}/graphql`
//   })
// ])

export const client = new ApolloClient({
  link,
  cache
});

// const instructions = Platform.select({
//   ios: 'Press Cmd+R to reload,\n' +
//     'Cmd+D or shake for dev menu',
//   android: 'Double tap R on your keyboard to reload,\n' +
//     'Shake or press menu button for dev menu',
// });

// type Props = {};

export default class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <AppWithNavigationState />
          </PersistGate>
        </Provider>
      </ApolloProvider>
    );
  }
}