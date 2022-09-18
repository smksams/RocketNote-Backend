require("express-async-errors")
const migrationsRun = require("./database/sqlite/migrations")
const express = require("express")
const cors = require("cors")

const AppError = require("./utils/AppError")
const routes = require("./routes")

migrationsRun()

const app = express()
app.use(cors())
app.use(express.json())

app.use(routes)


app.use(( error, request, response, next) => {
    if(error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message
        })
    }

    return response.status(500).json({
        status: "error",
        message: "internal server error"
    })

})

const PORT = 3333
app.listen(PORT, () => console.log(`Server on port: ${PORT} is running`))