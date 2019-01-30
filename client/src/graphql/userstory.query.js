import gql from 'graphql-tag';

const USERSTORY_QUERY = gql`
  query userstory($userstoryId: Int!) {
    userstory(userstoryId: $userstoryId) {
      id
      name
      users {
        id
        username
      }
      tasks {
          title
          state
      }
    }
  }
`;
export default USERSTORY_QUERY;