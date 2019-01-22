import gql from 'graphql-tag';

const UPDATE_USER_MUTATION = gql`
  mutation updateUser($id: Int!, $name: String!) {
    updateUser(id: $id, name: $name) {
      name
    }
  }
`;

export default UPDATE_USER_MUTATION;