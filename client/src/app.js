/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider } from 'react-apollo';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createHttpLink } from 'apollo-link-http';
// import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { ReduxCache, apolloReducer } from 'apollo-cache-redux';
import ReduxLink from 'apollo-link-redux';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';


import AppWithNavigationState, { navigationReducer, navigationMiddleware } from './navigation';

const store = createStore(
  combineReducers({
    apollo: apolloReducer,
    nav: navigationReducer,
  }),
  {}, // initial state
  composeWithDevTools(
    applyMiddleware(navigationMiddleware),
  ),
);

const URL = '10.0.2.2:8080'; // set your comp's url here

const cache = new ReduxCache({ store });

const reduxLink = new ReduxLink(store);

const errorLink = onError((errors) => {
  console.log(errors);
});

const httpLink = createHttpLink({ uri: `http://${URL}/graphql` });

// Create WebSocket client
export const wsClient = new SubscriptionClient(`ws://${URL}/subscriptions`, {
  reconnect: true,
  connectionParams: {
    // Pass any arguments you want for initialization
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
    queryOrMutationLink: httpLink,
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

type Props = {};

export default class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <AppWithNavigationState />
          {/* <View style={styles.container}>
            <Text style={styles.welcome}>
              Welcome to React Native! This is my first Chat Application!
            </Text>
            <Text style={styles.instructions}>
              To get started, edit App.js
            </Text>
            <Text style={styles.instructions}>
              {instructions}
            </Text>
          </View> */}
        </Provider>
      </ApolloProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: 'red',
    marginBottom: 5,
  },
});
