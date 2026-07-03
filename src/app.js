import express from "express"
import cors from "cors"
const app = express()

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))

app.use(
    cors({
        origin: process.env.CORS_ORIGIN ?.split(",") || "http://localhost:5137",
        credentials: true,
        methods : ["GET","POST", "PUT", "PATCH", "DELETE","OPTIONS"],
        allowedHeaders:["Content-Type","Authorization"]
    })
)

app.get('/', (req, res) => {
  res.send('Launching first backend as a project!')
})
app.get('/github', (req, res) => {
  res.send('This is the gold mine for me in the coming future and for getting wherever i want to!')
})

export default app