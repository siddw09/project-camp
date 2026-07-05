import express from "express"
import cors from "cors"
const app = express()
//basic config
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
//cors
app.use(
    cors({
        origin: process.env.CORS_ORIGIN ?.split(",") || "http://localhost:5137",
        credentials: true,
        methods : ["GET","POST", "PUT", "PATCH", "DELETE","OPTIONS"],
        allowedHeaders:["Content-Type","Authorization"]
    })
)

//health check function 
import healthcheckRoute from "./routes/healthCheck.route.js"

app.use("/api/v1/healthCheck", healthcheckRoute)


app.get('/', (req, res) => {
  res.send('Launching first backend as a project!')
})
app.get('/github', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>My GitHub Gold Mine</title>
        <style>
            body { font-family: sans-serif; background: #1a1a1a; color: #fff; text-align: center; padding: 50px; }
            h1 { color: #00ffcc; }
        </style>
    </head>
    <body>
        <h1>This is the gold mine for me!</h1>
        <p>Building the future, one commit at a time.</p>
    </body>
    </html>
    `)
})

export default app