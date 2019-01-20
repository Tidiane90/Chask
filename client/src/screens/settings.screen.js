import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { graphql, compose } from 'react-apollo';

import USER_QUERY from '../graphql/user.query';
import UPDATE_USER_MUTATION from '../graphql/update-user.mutation';
import { logout, setCurrentUser } from '../actions/auth.actions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 50,
  },
  email: {
    borderColor: '#777',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  subtitleHeader: {
    backgroundColor: '#dbdbdb',
    color: '#777',
    paddingHorizontal: 16,
    paddingBottom: 6,
    paddingTop: 32,
    fontSize: 12,
  },
  loading: {
    justifyContent: 'center',
    flex: 1,
  },
  userImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  imageContainer: {
    paddingRight: 20,
    alignItems: 'center',
  },
  input: {
    color: 'green',
    height: 50,
  },
  inputBorder: {
    borderColor: '#dbdbdb',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  inputInstructions: {
    paddingTop: 6,
    color: '#777',
    fontSize: 12,
    flex: 1,
  },
  userContainer: {
    paddingLeft: 16,
  },
  userInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingRight: 16,
  },
  buttonSettings: {
    padding: 10,
  }
});

class Settings extends Component {
  static navigationOptions = {
    title: 'Settings',
  };

  constructor(props) {
    super(props);
    this.state = {};
    // this.state = { username: this.props.user.username };
    this.logout = this.logout.bind(this);
    this.updateUser = this.updateUser.bind(this);
  }

  logout() {
    this.props.dispatch(logout());
  }

  // eslint-disable-next-line
  updateUser() {
    //updateUser eslint-disable-next-line

    console.log("username => ",this.state.username );
    console.log("id => ", this.props.auth.id);

    this.props.updateUser({
      id: this.props.auth.id,
      name: this.state.username,
    })
    .then(() => {
      console.log("new props username => ");
      console.log(this.props.user.username);

      console.log("props.user => ")
      console.log(this.props.user)

      // this.props.dispatch(setCurrentUser(this.props.user));
      //   this.setState({
      //     loading: false,
      //   });
    })
    .catch((e) => {
        console.log("error => ");
        console.log(e);
      })
  }
  render() {
    const { loading, user } = this.props;
    console.log("auth in settings")
    console.log(this.props)
    console.log(this.state)
    // render loading placeholder while we fetch data
    if (loading || !user) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.userContainer}>
          <View style={styles.userInner}>
            <TouchableOpacity style={styles.imageContainer}>
              {/* <Image
                style={styles.userImage}
                source={{ uri: 'https://reactjs.org/logo-og.png' }}
              /> */}
              <Icon
                name="address-card"
                size={80}
                // color={'#8c8c8c'}
              />
              <Text>edit</Text>
            </TouchableOpacity>
            <Text style={styles.inputInstructions}>
              Update your name and add an optional profile picture (Option to come in the next release)
            </Text>
          </View>
          <View style={styles.inputBorder}>
            <TextInput
              onChangeText={username => this.setState({ username })}
              placeholder={user.username}
              style={styles.input}
              defaultValue={user.username}
              value={this.state.username}
            />
          </View>
        </View>
        
        <Text style={styles.subtitleHeader}>EMAIL</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.subtitleHeader}>CURRENT WORKSPACE</Text>
        <Text style={styles.email}>{}</Text>
        
        <View style={styles.buttonSettings}>
          {/* <Button title="Save changes" onPress={this.updateUser} /> */}
          <Button title="Logout" onPress={this.logout} />
        </View>
      </View>
    );
  }
}

Settings.propTypes = {
  auth: PropTypes.shape({
    loading: PropTypes.bool,
    jwt: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
  user: PropTypes.shape({
    username: PropTypes.string,
  }),
  // updateUser: PropTypes.func.isRequired,
};

const userQuery = graphql(USER_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ({ auth }) => ({ variables: { id: auth.id }, fetchPolicy: 'cache-only' }),
  props: ({ data: { loading, user } }) => ({
    loading, user,
  }),
});
/*
const updateUserMutation = graphql(UPDATE_USER_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    updateUser: ({ id, name }) =>
      mutate({
        variables: { id, name },
        optimisticResponse: {
          __typename: 'Mutation',
          updateUser: {
            __typename: 'User',
            id: ownProps.auth.id, // we know the id
            username: name, // we know what the new username will be
          },
        },
        update: (store, { data: { updateUser } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({ query: USER_QUERY, variables: { id: ownProps.auth.id } }); 
          
          console.log("new name => ", name)
          console.log("data => ", data)
          // Add our new username from the mutation to the user.

          if(data.user.username !== name )
            data.user.username = name;

          // Write our data back to the cache.
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id }, 
            data,
          });
        },
      }),
  }),
});
*/


const mapStateToProps = ({ auth }) => ({
  auth,
});

// Nya.Bosco2@yahoo.com
// Chadrick42@yahoo.com

export default compose(
  connect(mapStateToProps),
  userQuery,
  // updateUserMutation,
)(Settings);