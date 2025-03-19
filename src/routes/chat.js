const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();
chatRouter.get("/chat/:targetedUserId", userAuth, async (req, res) => {
  const { targetedUserId } = req.params;
  const loggedinUserid = req.user._id;

  try {
    let chat =await Chat.findOne({
        participents: { $all: [loggedinUserid, targetedUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });
    if (!chat) {
      chat = new Chat({
        participents: [loggedinUserid, targetedUserId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (error) {
    console.log(error);
  }
});
module.exports = chatRouter;
