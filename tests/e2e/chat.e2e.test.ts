// AI-generated end-to-end test:
// user A sends a message, user B receives it via subscription.
import { createClient, Client } from 'graphql-ws';
import WebSocket from 'ws';

const USER_HTTP = process.env.USER_HTTP || 'http://localhost/api/user/graphql';
const CHAT_HTTP = process.env.CHAT_HTTP || 'http://localhost/api/chat/graphql';
const CHAT_WS = process.env.CHAT_WS || 'ws://localhost/api/chat/graphql';

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

async function graphqlRequest<T>(
  url: string,
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<GraphQLResponse<T>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  return (await res.json()) as GraphQLResponse<T>;
}

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        username
        displayName
      }
    }
  }
`;

const CREATE_ROOM_MUTATION = `
  mutation CreateRoom($name: String!) {
    createRoom(name: $name) {
      id
      name
    }
  }
`;

const JOIN_ROOM_MUTATION = `
  mutation JoinRoom($roomId: ID!) {
    joinRoom(roomId: $roomId) {
      id
      name
    }
  }
`;

const SEND_MESSAGE_MUTATION = `
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

const MESSAGE_ADDED_SUBSCRIPTION = `
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

describe('Real-time chat E2E', () => {
  let wsClient: Client | null = null;

  afterEach(() => {
    if (wsClient) {
      wsClient.dispose();
      wsClient = null;
    }
  });

  it('user A sends message, user B receives it via subscription', async () => {
    // Register user A
    const regA = await graphqlRequest<{
      register: { accessToken: string; user: { id: string } };
    }>(USER_HTTP, REGISTER_MUTATION, {
      input: {
        username: `userA_${Date.now()}`,
        displayName: 'User A',
        password: 'passwordA',
      },
    });
    if (regA.errors) {
      throw new Error(`Register A failed: ${regA.errors[0]?.message}`);
    }
    const tokenA = regA.data!.register.accessToken;
    const userAId = regA.data!.register.user.id;

    // Register user B
    const regB = await graphqlRequest<{
      register: { accessToken: string; user: { id: string } };
    }>(USER_HTTP, REGISTER_MUTATION, {
      input: {
        username: `userB_${Date.now()}`,
        displayName: 'User B',
        password: 'passwordB',
      },
    });
    if (regB.errors) {
      throw new Error(`Register B failed: ${regB.errors[0]?.message}`);
    }
    const tokenB = regB.data!.register.accessToken;
    const userBId = regB.data!.register.user.id;

    expect(userAId).not.toBe(userBId);

    // User A creates a room
    const createRoomRes = await graphqlRequest<{
      createRoom: { id: string; name: string };
    }>(
      CHAT_HTTP,
      CREATE_ROOM_MUTATION,
      { name: 'E2E Room' },
      tokenA,
    );
    if (createRoomRes.errors) {
      throw new Error(`Create room failed: ${createRoomRes.errors[0]?.message}`);
    }
    const roomId = createRoomRes.data!.createRoom.id;

    // User B joins the room
    const joinRoomRes = await graphqlRequest<{
      joinRoom: { id: string; name: string };
    }>(
      CHAT_HTTP,
      JOIN_ROOM_MUTATION,
      { roomId },
      tokenB,
    );
    if (joinRoomRes.errors) {
      throw new Error(`Join room failed: ${joinRoomRes.errors[0]?.message}`);
    }

    // User B subscribes to messageAdded for the room
    wsClient = createClient({
      url: CHAT_WS,
      webSocketImpl: WebSocket,
      connectionParams: {
        authorization: `Bearer ${tokenB}`,
      },
    });

    const receivedPromise = new Promise<{
      roomId: string;
      content: string;
      senderId: string;
    }>((resolve, reject) => {
      wsClient!.subscribe(
        {
          query: MESSAGE_ADDED_SUBSCRIPTION,
          variables: { roomId },
        },
        {
          next: (data) => {
            const payload: any = data.data;
            if (payload?.messageAdded) {
              resolve({
                roomId: payload.messageAdded.roomId,
                content: payload.messageAdded.content,
                senderId: payload.messageAdded.senderId,
              });
            }
          },
          error: reject,
          complete: () => {
            // no-op for this test
          },
        },
      );
    });

    // User A sends a message
    const messageText = 'Hello from user A';
    const sendRes = await graphqlRequest<{
      sendMessage: { id: string; content: string; roomId: string };
    }>(
      CHAT_HTTP,
      SEND_MESSAGE_MUTATION,
      { roomId, content: messageText },
      tokenA,
    );
    if (sendRes.errors) {
      throw new Error(`Send message failed: ${sendRes.errors[0]?.message}`);
    }

    const received = await receivedPromise;

    expect(received.roomId).toBe(roomId);
    expect(received.content).toBe(messageText);
    expect(received.senderId).toBe(userAId);
  });
});

