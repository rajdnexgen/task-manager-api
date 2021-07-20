require('../src/db/mongoose')
const Task = require('../src/models/task')

Task.findByIdAndDelete('60f541c7f797e896792ee64a').then((task) => {
    console.log(task)
    return Task.countDocuments({ completed: false })
}).then((result) => {
    console.log(result)
}).catch((e) => {
    console.log(e)
})