/**
 * Real-time Collaboration Service
 * WebRTC & WebSocket-based real-time collaboration
 *
 * Features:
 * - Live video/audio calls
 * - Screen sharing
 * - Real-time code collaboration
 * - Shared whiteboards
 * - Presence indicators
 */

import { io, Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { logger } from '../../lib/logger/logger';

export interface CollaborationRoom {
  id: string;
  name: string;
  participants: Participant[];
  createdAt: Date;
  createdBy: string;
}

export interface Participant {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  role: 'host' | 'participant' | 'viewer';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
}

export interface CollaborationOptions {
  serverUrl?: string;
  userId: string;
  userName: string;
  avatar?: string;
}

class CollaborationService {
  private socket: Socket | null = null;
  private peers: Map<string, SimplePeer.Instance> = new Map();
  private localStream: MediaStream | null = null;
  private options: CollaborationOptions | null = null;
  private currentRoom: CollaborationRoom | null = null;

  /**
   * Initialize collaboration service
   */
  async initialize(options: CollaborationOptions): Promise<void> {
    this.options = options;

    const serverUrl =
      options.serverUrl || process.env.REACT_APP_COLLABORATION_SERVER || 'http://localhost:3001';

    this.socket = io(serverUrl, {
      auth: {
        userId: options.userId,
        userName: options.userName,
      },
      transports: ['websocket'],
    });

    this.setupSocketListeners();
    logger.info('Collaboration service initialized');
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      logger.info('Connected to collaboration server');
    });

    this.socket.on('disconnect', () => {
      logger.info('Disconnected from collaboration server');
    });

    this.socket.on('room:joined', (room: CollaborationRoom) => {
      this.currentRoom = room;
      logger.info('Joined room:', { roomId: room.id });
    });

    this.socket.on('participant:joined', (participant: Participant) => {
      logger.info('Participant joined:', { userName: participant.userName });
      this.initiatePeerConnection(participant.id, true);
    });

    this.socket.on('participant:left', (participantId: string) => {
      logger.info('Participant left:', { participantId });
      this.removePeer(participantId);
    });

    this.socket.on('webrtc:signal', ({ from, signal }) => {
      const peer = this.peers.get(from);
      if (peer) {
        peer.signal(signal);
      }
    });

    this.socket.on('error', (error: Error) => {
      logger.error('Collaboration error:', error);
    });
  }

  /**
   * Create a new collaboration room
   */
  async createRoom(roomName: string): Promise<CollaborationRoom> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('room:create', { name: roomName }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.currentRoom = response.room;
          resolve(response.room);
        }
      });
    });
  }

  /**
   * Join an existing room
   */
  async joinRoom(roomId: string): Promise<CollaborationRoom> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('room:join', { roomId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.currentRoom = response.room;

          // Initiate peer connections with existing participants
          response.room.participants.forEach((participant: Participant) => {
            if (participant.userId !== this.options?.userId) {
              this.initiatePeerConnection(participant.id, false);
            }
          });

          resolve(response.room);
        }
      });
    });
  }

  /**
   * Leave current room
   */
  leaveRoom(): void {
    if (!this.socket || !this.currentRoom) return;

    this.socket.emit('room:leave', { roomId: this.currentRoom.id });

    // Clean up peer connections
    this.peers.forEach((peer) => peer.destroy());
    this.peers.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    this.currentRoom = null;
  }

  /**
   * Start video/audio stream
   */
  async startMedia(options: { video?: boolean; audio?: boolean } = {}): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: options.video ?? true,
        audio: options.audio ?? true,
      });

      this.localStream = stream;

      // Add stream to all existing peers
      this.peers.forEach((peer) => {
        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });
      });

      return stream;
    } catch (error) {
      logger.error('Failed to get media stream:', error);
      throw error;
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // Replace video track in all peer connections
      this.peers.forEach((peer) => {
        const sender = peer as any; // SimplePeer typing limitation
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && sender.replaceTrack) {
          sender.replaceTrack(
            this.localStream?.getVideoTracks()[0],
            videoTrack,
            this.localStream!
          );
        }
      });

      return stream;
    } catch (error) {
      logger.error('Failed to start screen share:', error);
      throw error;
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled: boolean): void {
    if (!this.localStream) return;

    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });

    this.socket?.emit('participant:update', {
      isAudioEnabled: enabled,
    });
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled: boolean): void {
    if (!this.localStream) return;

    this.localStream.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });

    this.socket?.emit('participant:update', {
      isVideoEnabled: enabled,
    });
  }

  /**
   * Send chat message
   */
  sendMessage(message: string): void {
    if (!this.socket || !this.currentRoom) return;

    this.socket.emit('chat:message', {
      roomId: this.currentRoom.id,
      message,
    });
  }

  /**
   * Share cursor position (for collaborative editing)
   */
  shareCursorPosition(x: number, y: number): void {
    if (!this.socket || !this.currentRoom) return;

    this.socket.emit('cursor:position', {
      roomId: this.currentRoom.id,
      x,
      y,
    });
  }

  /**
   * Initiate peer connection
   */
  private initiatePeerConnection(participantId: string, initiator: boolean): void {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: this.localStream || undefined,
    });

    peer.on('signal', (signal) => {
      this.socket?.emit('webrtc:signal', {
        to: participantId,
        signal,
      });
    });

    peer.on('stream', (stream) => {
      // Emit event for UI to handle remote stream
      const event = new CustomEvent('collaboration:stream', {
        detail: { participantId, stream },
      });
      window.dispatchEvent(event);
    });

    peer.on('error', (error) => {
      logger.error('Peer connection error:', error);
    });

    this.peers.set(participantId, peer);
  }

  /**
   * Remove peer connection
   */
  private removePeer(participantId: string): void {
    const peer = this.peers.get(participantId);
    if (peer) {
      peer.destroy();
      this.peers.delete(participantId);
    }
  }

  /**
   * Get current room
   */
  getCurrentRoom(): CollaborationRoom | null {
    return this.currentRoom;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    this.leaveRoom();
    this.socket?.disconnect();
    this.socket = null;
  }
}

// Singleton instance
export const collaborationService = new CollaborationService();
export default collaborationService;
