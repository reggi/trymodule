#!/usr/bin/env node

var npmi = require('npmi')
var path = require('path')
var colors = require('colors')

const packageLocation = (pkg, install_path) => {
  path.resolve(install_path, 'node_modules', pkg)
}

const loadPackage = (pkg, install_path) => {
  return new Promise((resolve, reject) => {
    try {
      const loadedPackage = require(packageLocation(pkg, install_path))
      console.log(colors.blue(`'${pkg}' was already installed since before!`))
      resolve({name: pkg, package: loadedPackage})
    } catch (err) {
      console.log(colors.yellow(`Couldn't find '${pkg}' locally, gonna download it now`))
      npmi({name: pkg, path: install_path}, (err, result) => {
        if (err) {
          console.log(colors.red(err.message))
          if (err.statusCode === 404) {
            throw new Error(`Could not find package ${pkg}`)
          }
          if (err.code === npmi.LOAD_ERR) {
            throw new Error('npm load error')
          }
          if (err.code === npmi.INSTALL_ERR) {
            throw new Error('npm install error')
          }
        }
        const loadedPackage = require(packageLocation(pkg, install_path))
        resolve({name: pkg, package: loadedPackage})
      })
    }
  })
}

module.exports = (packages_to_install, install_path) => {
  return new Promise((resolve, reject) => {
    const promises_for_installation = packages_to_install.map((package_name) => {
      loadPackage(package_name, install_path)
    })
    Promise.all(promises_for_installation).then(resolve).catch(reject)
  })
}
