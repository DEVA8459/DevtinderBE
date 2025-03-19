const express = require('express')

const profileRouter = express.Router()
const { userAuth } = require("../middlewares/auth");
const {validateProfileData} =require("../utils/validations")
 

// profile api 
profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
      const user = req.user;
      res.send(user); 
    } catch (err) {
      res.status(400).send("error fetching user " + err.message);
    }
  });

  profileRouter.patch("/profile/edit" ,userAuth ,async(req,res)=>{
    try { 
      if(!validateProfileData(req)){
        throw new Error("invalid Edit Request")
      }
      const loggedInUser =req.user

      Object.keys(req.body).forEach((key)=>(loggedInUser[key]=req.body[key]))
      await loggedInUser.save()

      res.json({message:`${loggedInUser.firstName} ,your profile updated successfully `,data:loggedInUser})

    } catch (error) {
      res.status(400).send("error fetching user " + error.message);
    }
    
  })

module.exports =profileRouter