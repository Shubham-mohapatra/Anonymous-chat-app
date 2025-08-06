const { io } = require("socket.io-client");
const readline = require("readline");

const socket = io("http://10.5.173.214:5000");

let roomId = null;

socket.on("connect", () => {
  console.log("Connected as", socket.id);
  socket.emit("join_queue", { topics: ["Technology"] });
  console.log("Joined queue with topic: Technology");
});

socket.on("matched", (data) => {
  roomId = data.roomId;
  console.log("Matched! Room ID:", roomId);
  startInputLoop();
});

socket.on("message", (data) => {
  console.log("Message from", data.sender + ":", data.message);
});

socket.on("peer_disconnected", () => {
  console.log("Peer disconnected.");
  process.exit(0);
});

function startInputLoop() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Type a message: "
  });

  rl.prompt();

  rl.on("line", (msg) => {
    if (roomId && msg.trim()) {
      socket.emit("message", { roomId, message: msg });
    }
    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}
