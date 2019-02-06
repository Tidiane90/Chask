import gql from 'graphql-tag';

// get the user and all user's groups
export const TASK_LIST_STATES_QUERY = gql`
    query enumValuesOfTaskStateEnum($enumName: String!) {
        __type(name: $enumName) {
        enumValues {
            name
        }
    }
}
`;

export default TASK_LIST_STATES_QUERY;