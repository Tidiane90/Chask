import gql from 'graphql-tag';

const LOGIN_MUTATION = gql`
  mutation login($workspaceName: String!, $email: String!, $password: String!) {
    login(workspaceName: $workspaceName, email: $email, password: $password) {
      id
      jwt
      username
      workspace {
        id 
        name
      }
    }
  }
`;

export default LOGIN_MUTATION;