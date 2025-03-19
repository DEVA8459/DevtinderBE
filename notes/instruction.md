1. creating the server

   1. we will use express js for creating server
   2. npm i express

   ```js
   const express = require('express')

    const app =express()

    app.use("/Home", (req, res) => {
    res.send("welcome Home");
    });
    app.use("/", (req, res) => {
    res.send("on th eserver");
    });

    //just dont know why it wont working
    app.use("/hello",(req ,res)=>{
        res.send("Hello World");
    });
    
    app.listen(3000 ,()=>{
        console.log("Server is running on port 3000");
    })

        //now i know 
        //if i put / in 1 st order it just overwrites other below it
        //so put "/" in last 
        //order of writing code matters alot
   ```
2. hot reload 
    1. npm i -g nodemon
    2. make sure @ root level 
    3. nodemon src/app.js
    4. make changes in package.jsson in script
    ```
    "start": "node src/app,js",
    "dev": "nodemon src/app.js",
    ```
    5. npm run dev

3. 
