const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequestModel = require("../models/connection");
const sendEmail = require("./sendEmail");

cron.schedule("0 8 * * *", async () => {
  // This
  console.log(
    "Running a job at 00:00 at the top of every hour to the top of every hour.",
    +new Date()
  );
  // Here you can add the code that you want to run every day at midnight.
  try {
    const yesterDay = subDays(new Date(), 1);
    const yesterDayStart = startOfDay(yesterDay);
    const yesterDayEnd = endOfDay(yesterDay);

    const pendingRequests = await ConnectionRequestModel.find({
      status: "intrested",
      createdAt: {
        $gte: yesterDayStart,
        $lt: yesterDayEnd,
      },
    }).populate("fromUserId toUserId");

    console.log(pendingRequests);

    const listofEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ]; //directly convert to array and remove duplicates
    console.log(listofEmails);

    for (const email of listofEmails) {
      try {
        const res = await sendEmail.run(
          "new friend request pending from  " +
            email ,
            "login to swipesync for more details"
        );
    
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
});
