const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/userRouter')
const taskRouter = require('./routers/taskRouter')

const User = require('./models/User')
const Task = require('./models/Task')

const port = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.get('/', (req, res) => {
    res.send('welcome to site')
})

app.listen(port, () => {
    console.log('start listening on port ' + port)
})

require('./emails/account')