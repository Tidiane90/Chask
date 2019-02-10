import gql from 'graphql-tag';

import MESSAGE_FRAGMENT from './message.fragment';

import USER_FRAGMENT from './user.fragment';


// get the user and all user's groups
export const USER_QUERY = gql`
  query user($id: Int) {
    user(id: $id) {
      id
      email
      username
      workspace {
        id
        name
      }
      groups {
        id
        name
        messages(first: 1) { # we don't need to use variables
          edges {
            cursor
            node {
              ... MessageFragment
            }
          }
        }
      }
      userstories {
        id
        name
        count
        tasks(first: 1) { # we don't need to use variables
          edges {
            cursor
            node {
              id
              title
              state
            }
          }
        }
      }
      friends {
        id
        username
      }
    }
  }
  ${MESSAGE_FRAGMENT}
`;

export default USER_QUERY;