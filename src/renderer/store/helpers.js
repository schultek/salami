
import base64 from "base64-img"
import opentype from "opentype.js"

import {remote} from "electron"

var dialog = remote.dialog

export function getDataURL(url) {
  return new Promise((resolve, reject) => {
    base64.base64(url, (err, data) => {
      if (err) reject(err);
      resolve(data);
    })
  })
}

export function showOpenDialog(options) {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(options, files => {
      if (files && files[0]) resolve(files[0])
      else resolve(null)
    })
  })
}

export function showSaveDialog(options) {
  return new Promise((resolve, reject) => {
    dialog.showSaveDialog(options, resolve)
  })
}

export function loadOpentypeFont(file) {
  return new Promise((resolve, reject) => {
    opentype.load(file, (err, font) => {
      if (err) reject(err)
      resolve(font)
    })
  })
}

export function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
