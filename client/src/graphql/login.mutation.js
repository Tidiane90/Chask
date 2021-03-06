import gql from 'graphql-tag';

const LOGIN_MUTATION = gql`
  mutation login($user: SigninUserInput!) {
    login(user: $user) {
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