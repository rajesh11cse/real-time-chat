// AI-generated Apollo Client setup for user-service (HTTP only, used imperatively)
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const userHttpUri =
  import.meta.env.VITE_USER_GRAPHQL_HTTP || '/api/user/graphql';

export const userClient = new ApolloClient({
  link: new HttpLink({
    uri: userHttpUri,
  }),
  cache: new InMemoryCache(),
});

