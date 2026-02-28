// AI-generated room creation/joining component
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ROOM, JOIN_ROOM } from '../graphql/chat';

type RoomSelectorProps = {
  onRoomSelected: (room: { id: string; name: string }) => void;
};

export const RoomSelector: React.FC<RoomSelectorProps> = ({
  onRoomSelected,
}) => {
  const [roomName, setRoomName] = useState('');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');

  const [createRoom, { loading: creating }] = useMutation(CREATE_ROOM);
  const [joinRoom, { loading: joining }] = useMutation(JOIN_ROOM);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await createRoom({ variables: { name: roomName } });
    onRoomSelected(data.createRoom);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await joinRoom({ variables: { roomId: roomIdToJoin } });
    onRoomSelected(data.joinRoom);
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Select or create a room</h2>
      <form onSubmit={handleCreate}>
        <label>
          New room name
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={creating}>
          {creating ? 'Creating…' : 'Create & join'}
        </button>
      </form>
      <hr />
      <form onSubmit={handleJoin}>
        <label>
          Join by room ID
          <input
            type="text"
            value={roomIdToJoin}
            onChange={(e) => setRoomIdToJoin(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={joining}>
          {joining ? 'Joining…' : 'Join room'}
        </button>
      </form>
    </div>
  );
};

