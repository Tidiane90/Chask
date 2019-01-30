import gql from 'graphql-tag';

const TASK_QUERY = gql`
  query task($userstoryId: Int!, $state: String!) {
    userstory(userstoryId: $userstoryId, state: $state) {
      id
      title
      belongsTo {
          id
          name
      }
      state
    }
  }
`;
export default TASK_QUERY;