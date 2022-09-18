const { Router } = require("express")

const usersRouter = require("./users.routes")
const notesRouter = require("./notes.routes")
const tagsRouter = require("./tags.routes")
const sessionRoutes = require("./session.routes")

const routes = Router()

routes.use("/users", usersRouter)
routes.use("/notes", notesRouter)
routes.use("/tags", tagsRouter)
routes.use("/session", sessionRoutes)

module.exports = routes