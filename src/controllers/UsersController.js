const { hash, compare } = require("bcryptjs")
const AppError = require("../utils/AppError")

const sqliteConnection = require("../database/sqlite")

class UsersController {
    /**
     * index - GET para listar varios registros.
     * show - GET para exibir um registro especifico.
     * create - POST para criar um registro.
     * update - PUT para atualizar um registro.
     * delete - DELETE para remover um registro.
     */

    async create(request, response) {
        const { name, email, password} = request.body

        const database = await sqliteConnection()
        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(checkUserExists) {
            throw new AppError("Este email ja foi cadastrado")
        }

        const hashedPassword = await hash(password, 8)

        try {
            await database.run(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                [name, email, hashedPassword])
        } catch {
            throw new AppError("Não foi possivel cadastrar")
        }


        return response.status(201).json()
    }

    async update(request, response) {
        const { name, email, password, old_password} = request.body
        const user_id  = request.user.id

        const database = await sqliteConnection()

        const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id])

        if(!user) {
            throw new AppError("Usuário não encontrado")
        }

        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError("Email ja cadastrado")
        }

        user.name = name ?? user.name
        user.email = email ?? user.email


        if(password && !old_password) {
            throw new AppError("Insira a senha antiga antes de atualizar")
        }

        if(!password && old_password) {
            throw new AppError("Insira a senha que deseja atualizar")
        }

        if(password && old_password) {
            const checkOldPassword = await compare( old_password, user.password)

            if(!checkOldPassword) {
                throw new AppError("Senha atual invalida")
            }

            user.password = await hash(password, 8)
        }



        await database.run(`
            UPDATE users SET
            name = ?,
            email = ?,
            password = ?,
            updated_at = DATETIME('now')
            WHERE id = ?`,
            [user.name, user.email, user.password, user_id]
        )

        return response.json()

    }


}

module.exports = UsersController