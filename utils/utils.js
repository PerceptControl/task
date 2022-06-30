const crypto = require('crypto')
const { isNumberObject, isStringObject } = require('util/types')
const fs = require('fs').promises

const GENDERS = {
  male: 1,
  female: 2,
}

exports.move = async function (from, to, dir) {
  await fs.rename(from, to)
}

exports.rmdir = async function (dir) {
  await fs.rm(dir, { force: true, recursive: true })
}

exports.makeHash = function (str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

exports.toMB = function (size) {
  return size * 1024 * 1024
}

exports.validator = class validator {
  static login(name, password) {
    this.validateLength({ name, password })
    this.validateName(name)
    this.validatePassword(password)
  }

  static register(name, password, email) {
    this.validateLength({ name, password, email })
    this.validateName(name)
    this.validatePassword(password)
    this.validateEmail(email)
  }

  static page(page) {
    if (page <= 0) throw Error('Page must be >= 1')
  }

  static validateLength(params) {
    let validCounter = 0
    for (let [name, value] of Object.entries(params)) {
      switch (name) {
        case 'name':
          value.length < 32 ? validCounter++ : 0
          break
        case 'password':
          value.length < 64 ? validCounter++ : 0
          break
        case 'email':
          value.length < 128 ? validCounter++ : 0
          break
        case 'surname':
          value.length < 64 ? validCounter++ : 0
          break
      }
    }

    if (validCounter < Object.keys(params).length) throw Error('Some of arguments out of length')
  }

  static validateID(id) {
    id = parseInt(id, 10)
    if (typeof id != 'number' && !isNumberObject(id)) throw Error('ID must be number')
    if (id < 1) throw Error('ID must be >= 1')
  }

  static validateImage(image) {
    if (image.mimetype != 'image/png' && image.mimetype != 'image/jpeg')
      throw Error('File must have .jpg or .png  format')
    if (image.file.field > 230) throw Error('File name must be shorter')
  }

  static validateGender(gender) {
    if (gender <= 0 || gender > 2)
      throw Error(`Gender myst be ${GENDERS.male} for male or ${GENDERS.female} for female`)
  }

  static validateName(str) {
    if (!this.isString(str)) throw Error('name not a string')
    if (str.length < 5) throw Error('name have less than 5 characters')
  }

  static validateSurName(str) {
    if (!this.isString(str)) throw Error('surname not a string')
    if (str.length < 5) throw Error('surname have less than 8 characters')
  }

  static validatePassword(str) {
    if (!this.isString(str)) throw Error('password not a string')
    if (str.length < 8) throw Error('password have less than 8 characters')
  }

  static validateEmail(str) {
    if (!this.isString(str)) throw Error('email not a string')
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str)) throw Error('email have bad syntax')
  }

  static isString(str) {
    if (typeof str != 'string' && !isStringObject(str)) return false
    return true
  }
}
