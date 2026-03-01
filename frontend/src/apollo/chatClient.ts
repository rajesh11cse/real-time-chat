// AI-generated Apollo Client setup for chat-service (HTTP + WebSocket)
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const chatHttpUri =
  import.meta.env.VITE_CHAT_GRAPHQL_HTTP || '/api/chat/graphql';

function computeWsUrlFromLocation(httpPath: string): string {
  // AI-generated: construct ws(s)://<host>/<path> based on current page location
  if (typeof window === 'undefined') {
    return `ws://localhost${httpPath}`;
  }
  const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${scheme}//${window.location.host}${httpPath}`;
}

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('chat_jwt');
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const httpLink = new HttpLink({ uri: chatHttpUri });

const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url:
            import.meta.env.VITE_CHAT_GRAPHQL_WS ||
            computeWsUrlFromLocation(chatHttpUri),
          connectionParams: () => {
            const token = localStorage.getItem('chat_jwt');
            return {
              authorization: token ? `Bearer ${token}` : undefined,
              Authorization: token ? `Bearer ${token}` : undefined,
            };
          },
          retryAttempts: 5,
          keepAlive: 10000,
          onConnected: () => console.log('[chat] WebSocket connected'),
          onError: (err) => console.warn('[chat] WebSocket error', err),
        }),
      )
    : null;

const splitLink = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      ApolloLink.from([authLink, httpLink]),
    )
  : ApolloLink.from([authLink, httpLink]);

export const chatClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

