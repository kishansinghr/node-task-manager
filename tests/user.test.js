const request = require('supertest')
const { userOne, userTwo, databaseSetup } = require('./fixtures/db')
const app = require('../src/app')
const User = require('../src/models/User')

const userOneId = userOne._id

beforeEach(async () => {
    await databaseSetup()
})

test('should create user', async () => {
    const response = await request(app).post('/users').send({
        name: "kishan",
        email: "kishansr021@gmail.com",
        password: "test#123"
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: "kishan",
            email: "kishansr021@gmail.com"
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('test#123')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should login fail with non existing user', async () => {
    await request(app).post('/users/login').send({
        email: 'nonexistinguser@gmail.com',
        password: userOne.password
    }).expect(400)
})

test('Should get user profile by authenticated user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get user profile by unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete user profile by authenticated user', async () => {

    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)

    // setInterval(async () => {
    //     const user = await User.findById(userTwo)
    //     expect(user).toBeNull()
    //     done()
    // }, 1000)
})

test('Should not delete user profile by unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload user avatar', async () => {

    await request(app).post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/image001.jpg')
        .expect(200)

    const user = await User.findById(userOneId)

    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update name of user', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'updatedname'
        }).expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('updatedname')

})

test('Should not update invalid field in user', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            lastname: 'updatedname'
        }).expect(400)
})