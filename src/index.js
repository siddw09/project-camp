import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/db_connection.js"
dotenv.config({
    path: "./.env"
})

const port = process.env.PORT || 3000

connectDB()
  .then(()=>{
    app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
  })
  .catch((err)=>{
    console.error("mongoDB connection error", err)
    process.exit(1)
  })