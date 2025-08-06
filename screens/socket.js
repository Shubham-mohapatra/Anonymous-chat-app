import { io } from 'socket.io-client';

// Use your backend IP address
const socket = io('http://10.5.173.214:5000');

export default socket;
