import moment from 'moment';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  task: {
    flex: 0.8,
    backgroundColor: 'white',
    borderRadius: 6,
    marginHorizontal: 16,
    marginVertical: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 1,
    shadowOffset: {
      height: 1,
    },
  },
  myTask: {
    backgroundColor: '#dcf8c6',
  },
  taskUsername: {
    color: 'red',
    fontWeight: 'bold',
    paddingBottom: 12,
  },
  taskTime: {
    color: '#8c8c8c',
    fontSize: 11,
    textAlign: 'right',
  },
  taskSpacer: {
    flex: 0.2,
  },
});

class Task extends PureComponent {
  render() {
    const { color, task, isCurrentUser } = this.props;
    return (
      <View key={task.id} style={styles.container}>
        {isCurrentUser ? <View style={styles.taskSpacer} /> : undefined }
        <View
          style={[styles.task, isCurrentUser && styles.myTask]}
        >
          <Text
            style={[
              styles.taskUsername,
              { color },
            ]}
          >{task.from.username}</Text>
          <Text>{task.text}</Text>
          <Text style={styles.taskTime}>{moment(task.createdAt).format('h:mm A')}</Text>
        </View>
        {!isCurrentUser ? <View style={styles.taskSpacer} /> : undefined }
      </View>
    );
  }
}
Task.propTypes = {
  color: PropTypes.string.isRequired,
  task: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    from: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }),
    text: PropTypes.string.isRequired,
  }).isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
};
export default Task;