const fs = require('fs')
const path = require('path')

function getLatestManifestFile() {
  return new Promise((resolve, reject) => {
    fs.readdir(path.resolve('data'), (err, files) => {
      if (err) throw(err)
      const latest = files.sort()[files.length-1]
      resolve(path.resolve('data', latest))
    })
  })
}

function readManifest(manifest) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(manifest), (err, buf) => {
      if (err) throw(err)
      resolve(JSON.parse(buf.toString()))
    })
  })
}

function getLatestUrls() {
  return getLatestManifestFile()
    .then(readManifest)
    .catch(console.error)
}

exports.latestUrls = getLatestUrls
