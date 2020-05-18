const request = require('supertest')
const { userOne, userTwo, taskOne, databaseSetup } = require('./fixtures/db')
const app = require('../src/app')
const Task = require('../src/models/Task')

beforeEach(async () => {
    await databaseSetup()
})

test('Should save task', async () => {
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'testtask',
            completed: true
        }).expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.owner._id).toEqual(userOne._id)
})

test('Should get tasks for user', async () => {
    const response = await request(app).get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send().expect(200)

    console.log(response.tasks)
    expect(response.body.length).toBe(2)
})

test('Should not delete other user\'s tasks', async () => {
    await request(app).delete('/tasks/' + taskOne._id.toString())
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send().expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})