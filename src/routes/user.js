const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connection");
const User = require("../models/user");
const userRouter = express.Router();

// get all the pending connection request for the logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "intrested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "photoUrl",
      "age",
      "about",
      "city",
      "skills",
    ]);

    res.json({
      message: "Data fetch Successfully",
      data: connectionRequest,
    });
  } catch (error) {
    req.statusCode(400).send("Error" + error.message);
  }
});

userRouter.get(
  "/user/connection/ignore&Rejected",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      const allowedStatus = ["ignore", "rejected"];

      const connectionRequest = await ConnectionRequest.find({
        $or: [
          { toUserId: loggedInUser._id, status:allowedStatus },
          { fromUserId: loggedInUser._id, status:allowedStatus },
        ],
      })
        .populate("fromUserId", "firstName lastName photoUrl about")
        .populate("toUserId", "firstName lastName photoUrl about");

      const data = connectionRequest.map((row) => ({
        status: row.status,
        user:
          row.fromUserId._id.toString() === loggedInUser._id.toString()
            ? row.toUserId
            : row.fromUserId,
      }));

      res.json({
        message: "Connection fetch Success",
        data,
      });
    } catch (error) {
      req.status(400).json({ message: error.message });
    }
  }
);
userRouter.get("/user/connection", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "firstName lastName photoUrl about age gender city skills movies education hobby")
      .populate("toUserId", "firstName lastName photoUrl about age gender city skills movies education hobby");

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({
      message: "Connection fetch Success",
      data,
    });
  } catch (error) {
    req.statusCode(400).json({ message: error.message });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all connection requests (sent/received)
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // Store IDs of users to hide in feed
    const hideUserFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId.toString());
      hideUserFromFeed.add(req.toUserId.toString());
    });

    // Exclude the logged-in user
    hideUserFromFeed.add(loggedInUser._id.toString());

    // Fetch users excluding the logged-in user and connected users
    const users = await User.find({
      _id: { $nin: [...hideUserFromFeed] },
    })
      .select("-password -__v") // Exclude sensitive fields
      .skip(skip)
      .limit(limit);

    res.json(users);
  } catch (error) {
    console.error("Error fetching user feed:", error);
    res.status(400).json({ message: error.message });
  }
});
userRouter.delete("/user/connection/:id", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionId = req.params.id;

    const connection = await ConnectionRequest.findOneAndDelete({
      $or: [
        { toUserId: loggedInUser._id, fromUserId: connectionId },
        { fromUserId: loggedInUser._id, toUserId: connectionId },
      ],
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    res.json({ message: "Connection deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = userRouter;
