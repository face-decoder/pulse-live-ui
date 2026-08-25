export * from './prediction'
export * from './history'

/** Connection lifecycle for the WebRTC signaling channel. */
export enum ConnectionStatus {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
}
