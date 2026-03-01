// room creation/joining component
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
    <div className="card">
      <h2 className="card-title">Choose a room</h2>
      <div className="room-actions">
        <div>
          <span className="section-label">Create a room</span>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="room-name">Room name</label>
              <input
                id="room-name"
                type="text"
                className="input"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. General"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating} style={{ width: '100%' }}>
              {creating ? 'Creating…' : 'Create & join'}
            </button>
          </form>
        </div>
        <div className="divider" />
        <div>
          <span className="section-label">Join by room ID</span>
          <form onSubmit={handleJoin}>
            <div className="form-group">
              <label htmlFor="room-id">Room ID</label>
              <input
                id="room-id"
                type="text"
                className="input"
                value={roomIdToJoin}
                onChange={(e) => setRoomIdToJoin(e.target.value)}
                placeholder="Enter room ID"
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary" disabled={joining} style={{ width: '100%' }}>
              {joining ? 'Joining…' : 'Join room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

