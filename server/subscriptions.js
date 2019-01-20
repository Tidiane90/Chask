import { PubSub } from 'apollo-server';
import { $$asyncIterator } from 'iterall';
import { parse } from 'graphql';
import { getArgumentValues } from 'graphql/execution/values';

// export function getSubscriptionDetails({ baseParams, schema }) {
//     const parsedQuery = parse(baseParams.query);
//     let args = {};
//     // operationName is the name of the only root field in the
//     // subscription document
//     let subscriptionName = '';
//     parsedQuery.definitions.forEach((definition) => {
//       if (definition.kind === 'OperationDefinition') {
//         // only one root field is allowed on subscription.
//         // No fragments for now.
//         const rootField = (definition).selectionSet.selections[0];
//         subscriptionName = rootField.name.value;
//         const fields = schema.getSubscriptionType().getFields();
//         args = getArgumentValues(
//           fields[subscriptionName],
//           rootField,
//           baseParams.variables,
//         );
//       }
//     });
//     return { args, subscriptionName };
//   }

export const pubsub = new PubSub();

pubsub.asyncAuthIterator = (messages, authPromise) => {
  const asyncIterator = pubsub.asyncIterator(messages);
  return {
    next() {
      return authPromise.then(() => asyncIterator.next());
    },
    return() {
      return authPromise.then(() => asyncIterator.return());
    },
    throw(error) {
      return asyncIterator.throw(error);
    },
    [$$asyncIterator]() {
      return asyncIterator;
    },
  };
};

export default pubsub;