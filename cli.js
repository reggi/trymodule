#! /usr/bin/env node

var repl = require('repl')
var path = require('path')
var os = require('os')
var colors = require('colors')
var replHistory = require('repl.history')
var exec = require('child_process').exec
var loadPackages = require('./index')

const TRYMODULE_PATH = process.env.TRYMODULE_PATH || path.resolve((os.homedir()), '.trymodule')
const TRYMODULE_HISTORY_PATH = process.env.TRYMODULE_HISTORY_PATH || path.resolve(TRYMODULE_PATH, 'repl_history')

const flags = [];
const packages = [];

process.argv.slice(2).forEach(arg => {
  if(arg[0] === '-') {
    // matches '--clear', '-v', etc
    flags.push(arg);
  } else {
    packages.push(arg);
  }
})

if (process.argv[2] === undefined) {
  throw new Error('You need to provide package name as first argument')
}

const logGreen = (msg) => console.log(colors.green(msg))

const takePackageArguments = (args) => args.splice(2)

const addPackageToObject = (obj, pkg) => {
  const variable_friendly_package_name = pkg.name.replace(/-|\./g, '_')
  logGreen(`Package '${pkg.name}' was loaded and assigned to '${variable_friendly_package_name}' in the current scope`)
  obj[variable_friendly_package_name] = pkg.package
  return obj
}

if (process.argv[2] === '--clear') {
  console.log(`Removing folder ${TRYMODULE_PATH + '/node_modules'}`)
  exec('rm -r ' + TRYMODULE_PATH + '/node_modules', (err, stdout, stderr) => {
    if (!err) {
      logGreen('Cache successfully cleared!')
      process.exit(0)
    } else {
      throw new Error('Could not remove cache! Error ' + err)
    }
  })
} else {
  logGreen('Gonna start a REPL with packages installed and loaded for you')
  const packages_to_install = takePackageArguments(process.argv)

  // Extract
  loadPackages(packages_to_install, TRYMODULE_PATH).then((packages) => {
    const context_packages = packages.reduce((context, pkg) => {
      return addPackageToObject(context, pkg)
    }, {})
    console.log('REPL started...')
    if (!process.env.TRYMODULE_NONINTERACTIVE) {
      var replServer = repl.start({
        prompt: '> '
      })
      replHistory(replServer, TRYMODULE_HISTORY_PATH)
      replServer.context = Object.assign(replServer.context, context_packages)
    }
  })
}
