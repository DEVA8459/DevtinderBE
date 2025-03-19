const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://devendragour621:fQmAadlyHnBBW771@cluster0.wfg2r.mongodb.net/devtinder"
  );
};

module.exports= connectDB

