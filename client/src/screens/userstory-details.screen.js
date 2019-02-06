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

import { TASK_LIST_STATES_QUERY } from '../graphql/taskListStates.query';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    flex: 1,
  },
  titleWrapper: {
    alignItems: 'flex-start',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleImage: {
    marginRight: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  taskContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  taskStateName: {
    fontWeight: 'bold',
    flex: 0.7,
  },
  taskTextContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 6,
  },
  taskText: {
    // color: '#8c8c8c',
    color: 'brown',
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
// const formatCreatedAt = createdAt => moment(createdAt).calendar(null, {
//   sameDay: '[Today]',
//   nextDay: '[Tomorrow]',
//   nextWeek: 'dddd',
//   lastDay: '[Yesterday]',
//   lastWeek: 'dddd',
//   sameElse: 'DD/MM/YYYY',
// });

// const Header = ({ onPress }) => (
//   <View style={styles.header}>
//     <Button title={'New User story'} onPress={onPress} />
//   </View>
// );

// Header.propTypes = {
//   onPress: PropTypes.func.isRequired,
// };

// we'll fake signin for now
// let IS_SIGNED_IN = false;

class UserstoryDetails extends Component {
  static navigationOptions = ({ navigation }) => {
    const { state, navigate } = navigation;
    
    // const goToGroupDetails = navigate.bind(this, 'GroupDetails', {
    //   id: state.params.groupId,
    //   title: state.params.title,
    // });

    return {
      headerTitle: (
        <TouchableOpacity
          style={styles.titleWrapper}
          // onPress={goToGroupDetails}
        >
          <View style={styles.title}>
            <Image
              style={styles.titleImage}
              source={{ uri: 'https://reactjs.org/logo-og.png' }}
            />
            <Text>{state.params.title}</Text>
          </View>
        </TouchableOpacity>
      ),
    };
  };

    constructor(props) {
        super(props);
        this.goToTasks= this.props.goToTasks.bind(this, this.props.task);
    }

    keyExtractor = item => item.id.toString();

    goToTasks(state) {
      const { navigate } = this.props.navigation;
      console.log(state);
      // navigate('Messages', { groupId: group.id, title: group.name });
    }

    renderItem = ({ item }) => <Text state={`${item.name}`} goToTasks={this.goToTasks} />;

    render() {
      const { loading, __type } = this.props;
      console.log(this.props)
      // render loading placeholder while we fetch messages
      if (loading || !__type) {
        return (
          <View style={[styles.loading, styles.container]}>
            <ActivityIndicator />
          </View>
        );
      }
      return (
        <View style={styles.container}>
        <FlatList
          data={__type.enumValues}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => <Text>{`${item.name}`}</Text>}
          // ListHeaderComponent={() => <Header onPress={this.goToNewGroup} />}
          // onRefresh={this.onRefresh}
          // refreshing={networkStatus === 4}
        />
      </View>
      // <TouchableHighlight
      //   key={id}
      //   onPress={this.goToTasksWindow}
      // >
      //     <View style={styles.userstoryContainer}>
      //       <Image
      //         style={styles.userstoryImage}
      //         source={{
      //           uri: 'https://reactjs.org/logo-og.png',
      //         }}
      //       />
      //       <View style={styles.userstoryTextContainer}>
      //         <View style={styles.userstoryTitleContainer}>
      //           <Text style={styles.userstoryNameUs}>{`${name}`}</Text>
      //           <Text style={styles.userstoryLastUpdated}>
      //             {tasks.length ?
      //               formatCreatedAt(tasks[0].createdAt) : ''}
      //           </Text>
      //         </View>
      //         {/* <Text style={styles.userstoryName}>
      //           {"Recent changed task: " +(tasks.length ?
      //             `${tasks[0].title}` : '')}
      //         </Text> */}
      //         <Text style={styles.userstoryText} numberOfLines={1}>
      //           {"Total tasks: " +(tasks.length ?  +tasks.length : "No tasks present")}
      //         </Text>
      //       </View>
      //       <Icon
      //         name="angle-right"
      //         size={24}
      //         color={'#8c8c8c'}
      //       />
      //     </View>
      // </TouchableHighlight>
      );
    }
}

UserstoryDetails.propTypes = {
  goToTasks: PropTypes.func.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        userstoryId: PropTypes.number,
      }),
    }),
  }),
  loading: PropTypes.bool,
  __type: PropTypes.shape({
    enumValues:PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.oneOf(["TO_DO", "IN_PROGRESS", 'DONE']),
      }),
    ),
  })
  
  // userstory: PropTypes.shape({
  //   id: PropTypes.number,
  //   name: PropTypes.string,
  //   ownerId: PropTypes.bool,
  //   tasks: PropTypes.arrayOf(
  //     PropTypes.shape({
  //         id:  PropTypes.number.isRequired,
  //         title: PropTypes.string.isRequired,
  //         state: PropTypes.oneOf(["TO_DO", "IN_PROGRESS", 'DONE']),
  //     })
  // ),
  // }),
};


const taskListStatesQuery = graphql(TASK_LIST_STATES_QUERY, {
  //skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ownProps => ({ variables: { enumName: "TaskStateEnum"  } }),
  props: ({ data: { loading, __type } }) => ({
    loading, __type,
  }),
})
// const userstoryQuery = graphql(USERSTORY_QUERY, {
//   skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
//   options: ownProps => ({ variables: { id: 1 } }),
//   props: ({ data: { loading, enumValuesOfTaskStateEnum } }) => ({
//     loading, user,
//   }),
// })

const mapStateToProps = ({ auth }) => ({
  auth,
});

export default compose(
  connect(mapStateToProps),
  taskListStatesQuery,
  //userstoryQuery,
)(UserstoryDetails);

// export default userQuery(Groups);

// export default Groups;