const socket = require("socket.io");
const { Chat } = require("../models/chat");
const ConnectionRequest =require("../models/connection")

const initializedSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    //handle event

    socket.on("joinChat", ({ loggedinUserid, targetedUserId }) => {
      const roomId = [loggedinUserid, targetedUserId].sort().join("_");
      socket.join(roomId);
      console.log(roomId);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, loggedinUserid, targetedUserId, text }) => {
        try {
          const roomId = [loggedinUserid, targetedUserId].sort().join("_");
          //save messages with database

          //TODO: Check if userId & targetUserId are friends
          //TODO: limit api call to 100 messages per call
          //TODO: improove security bug-auth in web socket 
          //TODO: show green symbol with online 
          //TODO: show green symbol with online 


          let chat = await Chat.findOne({
            participents: { $all: [loggedinUserid, targetedUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participents: [loggedinUserid, targetedUserId],
              messages: [],
            });
          }
          chat.messages.push({
            senderId: loggedinUserid,
            text,
          });

          await chat.save();
          io.to(roomId).emit("newMessageRecived", { firstName, text });
        } catch (err) {
          console.log(err)
        }
       
      }
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = initializedSocket;
