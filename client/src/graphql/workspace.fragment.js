import gql from 'graphql-tag';

const WORKSPACE_FRAGMENT = gql`
  fragment WorkspaceFragment on User {
    id
    workspace {
        id
        name
    }
  }
`;

export default WORKSPACE_FRAGMENT;