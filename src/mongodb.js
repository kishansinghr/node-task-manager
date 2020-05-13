const { MongoClient } = require('mongodb')


const connectionUrl = "mongodb://127.0.0.1:27017"
const databaseName = 'task-manager'

MongoClient.connect(connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
        return console.log("Error in connecting to mongo db. " + error)
    }

    const db = client.db(databaseName)

    const taskCollection = db.collection('tasks');

    taskCollection.deleteOne({ description:'sleep' },
        {
            $set: {
                completed: true
            }
        }).then(data => console.log(data.result))
        .catch(err => console.log("error->" + err));


    // db.collection('users').insertOne({
    //     name: 'kishan',
    //     age: 26
    // })

    // db.collection('tasks').insertMany(
    //     [{
    //         description: 'take tea',
    //         completed: true
    //     },
    //     {
    //         description: 'sleep',
    //         completed: false
    //     },
    //     {
    //         description: 'dinner',
    //         completed: false
    //     }],
    //     (error, response) => {
    //         if (error) {
    //             return console.log('error in inserting data in tasks')
    //         }
    //         console.log(response.ops)
    //     }
    // )
    console.log('connected succefully');
    // client.close();
})