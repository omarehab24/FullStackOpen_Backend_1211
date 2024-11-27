const express = require("express")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")
const config = require("./utils/config")
const logger = require("./utils/logger")
require("express-async-errors")

const blogRouter = require("./controllers/blogController")
const middleware = require("./utils/middleware")
const userRouter = require("./controllers/userController")
const loginRouter = require("./controllers/loginController")

mongoose.set("strictQuery", false)


mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB")
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message)
  })

// Application-level Middleware
app.use(cors())
app.use(express.static("dist"))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

// Routes
app.use("/api/login", loginRouter)
app.use("/api/users", userRouter)
app.use("/api/blogs", blogRouter)

// Error Handling Middleware
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app