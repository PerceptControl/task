const express = require('express')
const app = express()

const DataBase = require('./utils/database').db
const { validator, ...utils } = require('./utils/utils')

const constants = require('./const')

const busboy = require('express-busboy')

busboy.extend(app, {
  limits: {
    fileSize: utils.toMB(10),
  },
  upload: true,
  path: constants.UPLOAD_PATH,
  allowedPath: /./,
})

app.post('/user/register', async (req, res) => {
  try {
    let { name, password, email } = req.body
    validator.register(name, password, email)

    if (await DataBase.getUser(name).length) throw Error(`User ${name} exist`)

    hash = utils.makeHash(password)
    await DataBase.register(name, hash, email)

    res.status(200)
    res.send('Successful registration')
  } catch (E) {
    res.status(400).send(E.message)
  }
})

app.post('/user/login', async (req, res) => {
  try {
    let { name, password } = req.body
    validator.login(name, password)

    let result = await DataBase.getUser(name)
    if (!result.length) throw Error(`User ${name} doesn't exist`)

    let hash = utils.makeHash(password)
    if (result[0].password != hash) throw Error('incorrect password')

    res.status(200)
    res.send(`Welcome, ${name}`)
  } catch (E) {
    res.status(400).send(E.message)
  }
})

app.put('/profile/:id', async (req, res) => {
  try {
    let { id } = req.params
    validator.validateID(id)

    let [user] = await DataBase.getUserById(id)
    if (!user) throw Error(`User with id-${id} doesn't exist`)

    const validData = {}

    let image = req.files[Object.keys(req.files)[0]]
    if (image) {
      validator.validateImage(image)

      const newPath = `${constants.STORE_PATH}/${image.filename}`
      const tmpPath = `${__dirname}/${constants.UPLOAD_PATH}/${image.uuid}`

      utils.move(`${tmpPath}/${image.field}/${image.filename}`, newPath)
      utils.rmdir(tmpPath)

      await DataBase.updateImage(newPath, id)
      validData.image = newPath
    }

    let { surname, email, name, gender } = req.body
    if (name) {
      validator.validateName(name)
      await DataBase.updateName(name, id)

      validData.name = name
    }
    if (surname) {
      validator.validateSurName(surname)
      await DataBase.updateSurName(surname, id)

      validData.surname = surname
    }
    if (email) {
      validator.validateEmail(email)
      await DataBase.updateEmail(email, id)

      validData.email = email
    }

    if (gender) {
      validator.validateGender(gender)
      await DataBase.updateGender(gender, id)

      validData.email = email
    }

    res.status(200)
    res.json(validData)
  } catch (E) {
    res.status(400).send(E.message)
  }
})

app.get('/profile/:id', async (req, res) => {
  try {
    let { id } = req.params
    validator.validateID(id)

    let user = await DataBase.getUserById(id)
    if (!user.length) throw Error(`User with id-${id} doesn't exist`)

    res.status(200)
    res.json(user[0])
  } catch (E) {
    res.status(400).send(E.message)
  }
})

app.get('/profiles', async (req, res) => {
  try {
    let { page } = req.query
    validator.page(page)

    if (page != 1) page *= 10
    let result = await DataBase.getPage(page)

    if (!result.length) throw Error('Not found')

    res.status(200)
    res.json(result)
  } catch (E) {
    res.status(400).send(E.message)
  }
})

app.listen(constants.PORT, () => {
  console.log(`Example app listening on port ${constants.PORT}`)
})

function hash(str) {
  return crypto.createHash('md5').update(password).digest('hex')
}
