import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { graphql, compose } from 'react-apollo';
import { connect } from 'react-redux';

import { setCurrentUser } from '../actions/auth.actions';
import LOGIN_MUTATION from '../graphql/login.mutation';
import SIGNUP_MUTATION from '../graphql/signup.mutation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#eeeeee',
    // alignItems: 'stretch',
    // flexDirection: 'column',
    paddingHorizontal: 50,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderRadius: 4,
    marginVertical: 6,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  loadingContainer: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  switchAction: {
    paddingHorizontal: 4,
    color: 'blue',
  },
  submit: {
    marginVertical: 6,
  },
});

// For KeyboardAvoidingView bug on Android
const offset = (Platform.OS === 'android') ? -200 : 0;

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

class Signin extends Component {
  static navigationOptions = {
    title: 'Chask',
    headerLeft: null,
  };

  constructor(props) {
    super(props);

    if (props.auth && props.auth.jwt) {
        props.navigation.goBack();
    }

    this.state = {
      view: 'login',
    };

    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.switchView = this.switchView.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.jwt) {
      nextProps.navigation.goBack();
    }
  }

  // workspaceName:"testworkspace", email:"Justus.Rath@gmail.com", password:"molestiae"
  // workspaceName:"testworkspace", email:"Chadrick42@yahoo.com", password:"omnis"

  login() {
    const { workspaceName, email, password } = this.state;
    console.log(this.state)
    this.setState({
      loading: true,
    });
    this.props.login({ workspaceName:"testWorkspace", email:"Chadrick42@yahoo.com", password:"omnis" })
      .then(({ data: { login: user } }) => {
        // console.log("user =>")
        // console.log(user)

        this.props.dispatch(setCurrentUser(user));
        this.setState({
          loading: false,
        });
      }).catch((error) => {
        this.setState({
          loading: false,
        });
        Alert.alert(
          `${capitalizeFirstLetter(this.state.view)} error`,
          error.message,
          [
            { text: 'OK', onPress: () => console.log('OK pressed') }, // eslint-disable-line no-console
            { text: 'Forgot password', onPress: () => console.log('Forgot Pressed'), style: 'cancel' }, // eslint-disable-line no-console
          ],
        );
    });
  }

  signup() {
    this.setState({
        loading: true,
      });

    const { workspaceName, email, password } = this.state;

    this.props.signup({ email, password })
    .then(({ data: { signup: user } }) => {
        this.props.dispatch(setCurrentUser(user));
        this.setState({
        loading: false,
        });
    }).catch((error) => {
        this.setState({
        loading: false,
        });
        Alert.alert(
        `${capitalizeFirstLetter(this.state.view)} error`,
        error.message,
        [{ text: 'OK', onPress: () => console.log('OK pressed') }],  // eslint-disable-line no-console
        );
    });
  }

  switchView() {
    this.setState({
      view: this.state.view === 'signup' ? 'login' : 'signup',
    });
  }

  render() {
    const { view } = this.state;
    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        keyboardVerticalOffset={offset} 
        style={styles.container}
      >
        {this.state.loading ?
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View> : undefined}

        <View style={styles.inputContainer}>
          <TextInput
              onChangeText={workspaceName => this.setState({ workspaceName })}
              placeholder={'Type Workspace'}
              style={styles.input}
          />
          <TextInput
            onChangeText={email => this.setState({ email })}
            placeholder={'Type Email'}
            style={styles.input}
          />
          <TextInput
            onChangeText={password => this.setState({ password })}
            placeholder={'Type Password'}
            secureTextEntry
            style={styles.input}
          />
        </View>
        
        <Button
          onPress={this[view]}
          style={styles.submit}
          title={view === 'signup' ? 'Sign up' : 'Login'}
          disabled={this.state.loading || !!this.props.auth.jwt}
        />

        <View style={styles.switchContainer}>
          <Text>
            { view === 'signup' ?
              'Already have an account?' : 'New to Chask?' }
          </Text>
          <TouchableOpacity
            onPress={this.switchView}
          >
            <Text style={styles.switchAction}>
              {view === 'login' ? 'Sign up' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

Signin.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func,
  }),
  auth: PropTypes.shape({
    loading: PropTypes.bool,
    jwt: PropTypes.string,
  }),
  dispatch: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  signup: PropTypes.func.isRequired,
};

// Nya.Bosco2@yahoo.com
// Chadrick42@yahoo.com

// mutation {
//   login(
//     workspaceName:"testWorkspace",
//     email:"Chadrick42@yahoo.com",
//     password: "eligendi")
//   {
//     id, 
//     jwt,
//     username
//   }
// } 


const login = graphql(LOGIN_MUTATION, {
    props: ({ mutate }) => ({
      login: user =>
        mutate({
          variables: { user },
        }),
    }),
});

const signup = graphql(SIGNUP_MUTATION, {
    props: ({ mutate }) => ({
        signup: user =>
        mutate({
            variables: { user },
        }),
    }),
});

const mapStateToProps = ({ auth }) => ({
    auth,
});

export default compose(
    login,
    signup,
    connect(mapStateToProps),
)(Signin);