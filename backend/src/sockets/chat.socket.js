export function registerChatSocket(io) {
  io.on("connection", (socket) => {
    socket.on("conversation:join", (conversationId) =>
      socket.join(`conversation:${conversationId}`),
    );
  });
}
