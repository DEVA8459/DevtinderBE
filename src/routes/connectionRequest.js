const express = require("express");

const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connection");
const User = require("../models/user");

const sendEmail =  require("../utils/sendEmail")
 
//intrested AND  ignored
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignore", "intrested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type",
        });
      }
      //checking if userid is present in databse
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({
          message: "user not found",
        });
      }

      //we can also use the below code but we are handling this on schema level using middleware pre

      // if (fromUserId == toUserId) {
      //   return res.status(400).send({
      //     message: "Connection cannot be sent to self!!",
      //   });
      // }

      //what if there is allready a connection request
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).send({
          message: "Connection REquest Allready Exist!!",
        });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      const emailRes =await sendEmail.run( "A new friend request from " + req.user.firstName,
        req.user.firstName + " is " + status + " in " + toUser.firstName)
    
      res.json({
        message: `${req.user.firstName} is ${status} in  ${toUser.firstName}`,
        data,
      });
    } catch (error) {
      res.status(400).send("ERROR: " + error.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      //Validate the status
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "invalid status",
        });
      }

      // validating id

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "intrested",
      });
      if (!connectionRequest) {
        return res.status(404).json({
          message: "Connection request not found",
        });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({
        message: "Connection Request " + status,
        data,
      });
    } catch (error) {
      res.status(400).send("ERROR: " + error.message);
    }
  }
);



module.exports = requestRouter;
