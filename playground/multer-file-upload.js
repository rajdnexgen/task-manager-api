const multer = require('multer')
const express = require('express')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        // if (!file.originalname.endsWith('.pdf')) {
        //     cb(new Error('File must be a PDF'))
        // }

        if (!file.originalname.match(/\.(doc|docx)$/)) {
            cb(new Error('Please upload a word document'))
        }

        cb(undefined, true)
        // cb(new Error('File must be a PDF'))
        // cb(undefined, true)
        // cb(undefined, false)
    }
})
app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message } )
})

app.listen(port, () => {
    console.log(`Server is up on ${port}`)
})