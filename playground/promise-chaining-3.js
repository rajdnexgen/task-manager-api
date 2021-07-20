require('../src/db/mongoose')
const User = require('../src/models/user')

//60f5364fc6a3b5957c5fc3ca

// User.findByIdAndUpdate('60f554e79a53a89a43565c41', { age: 1}).then((user) => {
//     console.log(user)
//     return User.countDocuments({ age: 1 })
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })

const updateAgeAndCount = async (id, age) => {
    const user = await User.findByIdAndUpdate(id, { age })
    const count = await User.countDocuments({ age })
    return count
}

updateAgeAndCount('60f554e79a53a89a43565c41', 2).then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})