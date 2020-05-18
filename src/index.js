const app = require('./app')


const port = process.env.PORT
app.get('/', (req, res) => {
    res.send('welcome to site')
})

app.listen(port, () => {
    console.log('start listening on port ' + port)
})