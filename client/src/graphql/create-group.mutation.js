import gql from 'graphql-tag';

import MESSAGE_FRAGMENT from './message.fragment';
import GROUP_FRAGMENT from './group.fragment';

const CREATE_GROUP_MUTATION = gql`
  mutation createGroup($name: String!, $userIds: [Int!]) {
    createGroup(name: $name, userIds: $userIds) {
      id
      name
      ownerId
      users {
        id
        username
      }
      messages(first: 1) { # we don't need to use variables
        edges {
          cursor
          node {
            ... MessageFragment
          }
        }
      }
    }
  }
  ${MESSAGE_FRAGMENT}
`;

export default CREATE_GROUP_MUTATION;