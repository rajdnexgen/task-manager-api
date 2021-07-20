const bcrypt = require('bcryptjs')

const hashPassword = async () => {
    const password = 'rupraj123!'
    const hashedPassword = await bcrypt.hash(password, 8)

    console.log(password)
    console.log(hashedPassword);

    const isMatch = await bcrypt.compare('Rupraj123!', hashedPassword)

    console.log(isMatch)
}

hashPassword()