require('../src/db/mongoose')
const Task = require('../src/models/task')

// Task.findByIdAndDelete('60f541c7f797e896792ee64a').then((task) => {
//     console.log(task)
//     return Task.countDocuments({ completed: false })
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })

const deleteTaskAndCount = async (id, completed) => {
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({ completed })
    return count
}

deleteTaskAndCount('60f557ebadb5d19ad843bc3d', false).then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})