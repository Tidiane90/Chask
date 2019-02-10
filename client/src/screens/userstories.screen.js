import { _ } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  FlatList,
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { graphql, compose } from 'react-apollo';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';

import { USER_QUERY } from '../graphql/user.query';
import { USERSTORY_QUERY } from '../graphql/userstory.query';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    flex: 1,
  },
  userstoryContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userstoryNameUs: {
    fontWeight: 'bold',
    flex: 0.7,
  },
  userstoryTextContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 6,
  },
  userstoryText: {
    // color: '#8c8c8c',
    color: 'brown',
  },
  userstoryImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  userstoryTitleContainer: {
    flexDirection: 'row',
  },
  userstoryLastUpdated: {
    flex: 0.3,
    color: '#8c8c8c',
    fontSize: 11,
    textAlign: 'right',
  },
  userstoryName: {
    paddingVertical: 4,
    color: 'green',
  },
  header: {
    alignItems: 'flex-end',
    padding: 6,
    borderColor: '#eee',
    borderBottomWidth: 1,
  },
  warning: {
    textAlign: 'center',
    padding: 12,
  },
});

// create fake data to populate our ListView
// const fakeData = () => _.times(100, i => ({
//   id: i,
//   name: `Group ${i}`,
// }));

// format createdAt with moment
const formatCreatedAt = createdAt => moment(createdAt).calendar(null, {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: 'dddd',
  sameElse: 'DD/MM/YYYY',
});

const Header = ({ onPress }) => (
  <View style={styles.header}>
    <Button title={'New User story'} onPress={onPress} />
  </View>
);

Header.propTypes = {
  onPress: PropTypes.func.isRequired,
};

// we'll fake signin for now
// let IS_SIGNED_IN = false;

class Userstory extends Component {
    constructor(props) {
        super(props);
        this.goToUserstoryDetails= this.props.goToUserstoryDetails.bind(this, this.props.userstory);
    }

    render() {
      console.log(this.props)
      const { id, name, tasks } = this.props.userstory;
      return (
      <TouchableHighlight
        key={id}
        onPress={this.goToUserstoryDetails}
      >
          <View style={styles.userstoryContainer}>
            <Image
              style={styles.userstoryImage}
              source={{
                uri: 'https://reactjs.org/logo-og.png',
              }}
            />
            <View style={styles.userstoryTextContainer}>
              <View style={styles.userstoryTitleContainer}>
                <Text style={styles.userstoryNameUs}>{`${name}`}</Text>
                <Text style={styles.userstoryLastUpdated}>
                  {tasks.edges.length ?
                    formatCreatedAt(tasks.edges[0].node.createdAt) : ''}
                </Text>
              </View>
              <Text style={styles.userstoryName}>
                {"Recent changed task: " +(tasks.edges.length ?
                  `${tasks.edges[0].node.title}` : '')}
              </Text>
              <Text style={styles.userstoryText} numberOfLines={1}>
                {"Total tasks: " +(tasks.edges.length ?  +tasks.edges.length : "No tasks present")}
              </Text>
            </View>
            <Icon
              name="angle-right"
              size={24}
              color={'#8c8c8c'}
            />
          </View>
      </TouchableHighlight>
      );
    }
}

Userstory.propTypes = {
  goToUserstoryDetails: PropTypes.func.isRequired,
  userstory: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    ownerId: PropTypes.bool,
    tasks: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        cursor: PropTypes.string,
        node: PropTypes.object,
      })),
    }),
  }),
};

class Userstories extends Component {

  static navigationOptions = {
    title: 'Userstories',
  };

  constructor(props) {
    super(props);
    this.goToUserstoryDetails = this.goToUserstoryDetails.bind(this);
    this.goToNewUserstory = this.goToNewUserstory.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  // componentDidMount() {
  //   if (!IS_SIGNED_IN) {
  //     IS_SIGNED_IN = true;

  //     const { navigate } = this.props.navigation;

  //     navigate('Signin');
  //   }
  // }

  onRefresh() {
    this.props.refetch();
  }

  keyExtractor = item => item.id.toString();

  goToUserstoryDetails(userstory) {
    const { navigate } = this.props.navigation;
    // navigate('Userstorydetails', { userstoryId: userstory.id, title: userstory.name });
  }

  goToNewUserstory() {
    const { navigate } = this.props.navigation;
    // navigate('NewUserstory');
  }

  renderItem = ({ item }) => <Userstory userstory={item} goToUserstoryDetails={this.goToUserstoryDetails} />;

  render() {
    console.log(this.props)
    const { loading, user, networkStatus  } = this.props;

    // render loading placeholder while we fetch messages
    if (loading || !user) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      );
    }

    if (user && !user.userstories.length) {
      return (
        <View style={styles.container}>
          <Header onPress={this.goToNewUserstory} />
          <Text style={styles.warning}>{'You do not have any user stories.'}</Text>
        </View>
      );
    }
    
    // render list of user stories for user
    return (
      <View style={styles.container}>
        <FlatList
          data={user.userstories}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          ListHeaderComponent={() => <Header onPress={this.goToNewUserstory} />}
          onRefresh={this.onRefresh}
          refreshing={networkStatus === 4}
        />
      </View>
    );
  }
}

Userstories.propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }),
    loading: PropTypes.bool,
    networkStatus: PropTypes.number,
    refetch: PropTypes.func,
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        email: PropTypes.string.isRequired,
        userstories: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
                count: PropTypes.number.isRequired,
            }),
        ),
    }),
};

const userQuery = graphql(USER_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ownProps => ({ variables: { id: ownProps.auth.id } }),
  props: ({ data: { loading, networkStatus, refetch, user, error } }) => ({
    loading, networkStatus, refetch, user,
    //   if(error) {
    //       console.log("GQL Err groups.screen => :", error);
    //   }
    //   console.log("network status => ", networkStatus)
    //   console.log("refetch => ", refetch)
    // return {networkStatus, refetch, loading, user};
  }),
})

// const userstoryQuery = graphql(USERSTORY_QUERY, {
//   skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
//   options: ownProps => ({ variables: { id: 1 } }),
//   props: ({ data: { userstory } }) => ({
//     loading, networkStatus, refetch, user,
//   }),
// })

const mapStateToProps = ({ auth }) => ({
  auth,
});

export default compose(
  connect(mapStateToProps),
  userQuery,
  //userstoryQuery,
)(Userstories);