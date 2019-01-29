import gql from 'graphql-tag';
import MESSAGE_FRAGMENT from './message.fragment';


const UPDATE_USER_MUTATION = gql`
  mutation updateUsername($username: String!) {
    updateUsername(username: $username) {
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
      friends {
        id
        username
      }
    }
  }
  ${MESSAGE_FRAGMENT}
`;

export default UPDATE_USER_MUTATION;