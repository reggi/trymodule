#!/usr/bin/env node

var npmi = require('npmi')
var path = require('path')
var colors = require('colors')

const packageLocation = (pkg, installPath) => {
  return path.resolve(installPath, 'node_modules', pkg)
}

const loadPackage = (moduleName, moduleAs, installPath) => {
  return new Promise((resolve, reject) => {
    try {
      const loadedPackage = require(packageLocation(moduleName, installPath))
      console.log(colors.blue(`'${moduleName}' was already installed since before!`))
      resolve({name: moduleName, package: loadedPackage, as: moduleAs})
    } catch (err) {
      console.log(colors.yellow(`Couldn't find '${moduleName}' locally, gonna download it now`))
      npmi({name: moduleName, path: installPath}, (err, result) => {
        if (err) {
          console.log(colors.red(err.message))
          if (err.statusCode === 404) {
            throw new Error(`Could not find package ${moduleName}`)
          }
          if (err.code === npmi.LOAD_ERR) {
            throw new Error('npm load error')
          }
          if (err.code === npmi.INSTALL_ERR) {
            throw new Error('npm install error')
          }
        }
        const loadedPackage = require(packageLocation(moduleName, installPath))
        resolve({name: moduleName, package: loadedPackage, as: moduleAs})
      })
    }
  })
}

module.exports = (packagesToInstall, installPath) => {
  return new Promise((resolve, reject) => {
    const promisesForInstallation = []
    Object.keys(packagesToInstall).forEach(moduleName => {
      const as = packagesToInstall[moduleName]
      promisesForInstallation.push(loadPackage(moduleName, as, installPath))
    })
    Promise.all(promisesForInstallation).then(resolve).catch(reject)
  })
}
