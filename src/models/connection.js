const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"user" ,//refrence to the user Collection
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"user",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignore", "intrested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
        //similarly like this we can add in age field in userSchema
      },
    },
  },
  {
    timestamps: true,
  }
);
connectionSchema.index({
    fromUserId:1 ,toUserId:1
})
connectionSchema.pre("save", function (next) {
  const ConnectionRequest = this;

  if (ConnectionRequest.fromUserId.equals(ConnectionRequest.toUserId)) {
    throw new Error(
      "oh Common ! Cannot send connection request to yourself !!"
    );
  }
  next();
});

const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionSchema
);

module.exports = ConnectionRequestModel;
