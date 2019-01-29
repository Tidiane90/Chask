import gql from 'graphql-tag';
import MESSAGE_FRAGMENT from './message.fragment';

const USER_FRAGMENT = gql`
  fragment UserFragment on User {
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
  ${MESSAGE_FRAGMENT}
`;


export default USER_FRAGMENT;