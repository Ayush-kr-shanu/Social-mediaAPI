const express=require("express")
const { Connection } = require("./Config/db")
const { userRoute } = require("./Routes/User.routes")
const { authenticate } = require("./Middlewares/auth")
const { postRoute } = require("./Routes/Post.routes")

const app=express()

app.use(express.json())

app.get("/", (req,res)=>{
    res.send("Home page")
})

app.use("/api", userRoute)

app.use("/api", postRoute)


app.listen(4500, async()=>{
    try {
        await Connection
        console.log("DB connected");
    } catch (err) {
        console.log(err);
    }
    console.log("Port is live");
})