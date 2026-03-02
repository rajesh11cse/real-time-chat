// GraphQL operations for chat-service
import { gql } from '@apollo/client';

export const CREATE_ROOM = gql`
  mutation CreateRoom($name: String!) {
    createRoom(name: $name) {
      id
      name
      createdBy
      createdAt
    }
  }
`;

export const JOIN_ROOM = gql`
  mutation JoinRoom($roomId: ID!) {
    joinRoom(roomId: $roomId) {
      id
      name
      createdBy
      createdAt
    }
  }
`;

export const MESSAGES = gql`
  query Messages($roomId: ID!, $after: String, $limit: Int) {
    messages(roomId: $roomId, after: $after, limit: $limit) {
      edges {
        cursor
        node {
          id
          roomId
          senderId
          content
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($roomId: ID!, $content: String!) {
    sendMessage(roomId: $roomId, content: $content) {
      id
      roomId
      senderId
      content
      createdAt
    }
  }
`;

export const MESSAGE_ADDED = gql`
  subscription MessageAdded($roomId: ID!) {
    messageAdded(roomId: $roomId) {
      id
      roomId
      senderId
      content
      createdAt
    }
  }
`;

