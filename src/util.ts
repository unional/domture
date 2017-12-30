import fileUrl = require('file-url')
import fs = require('fs')
import path = require('path')
import { DOMWindow, JSDOM } from 'jsdom'
import { Domture } from './interfaces';
import { DomtureConfig } from './config';

export const url = fileUrl(process.cwd()) + '/'

export function preloadScripts(dom, preloadScripts, rootDir) {
  if (preloadScripts) {
    preloadScripts.forEach(s => loadScriptSync(dom.window, rootDir, s))
  }
}

export function extendJSDOM(dom: JSDOM, config: DomtureConfig) {
  const result = dom as any

  result.loadScript = function (this: Domture, identifier: string) {
    return loadScript(this.window, config.rootDir, identifier)
  }

  result.loadScriptSync = function (this: Domture, identifier: string) {
    loadScriptSync(this.window, config.rootDir, identifier)
  }
}

export function loadScript(window: DOMWindow, rootDir: string, identifier: string) {
  return loadScriptContent(rootDir, identifier)
    .then(content => {
      injectScriptTag(window, content)
    })
}

function loadScriptContent(rootDir: string, identifier: string) {
  const scriptPath = resolveScriptPath(rootDir, identifier)
  return new Promise<string>((a, r) => {
    fs.readFile(scriptPath, { encoding: 'utf8' }, (err, data) => {
      if (err) r(err)
      a(data)
    })
  })
}

export function loadScriptSync(window: DOMWindow, rootDir: string, identifier: string) {
  const content = loadScriptContentSync(rootDir, identifier)
  injectScriptTag(window, content)
}

function loadScriptContentSync(rootDir: string, identifier: string) {
  const scriptPath = resolveScriptPath(rootDir, identifier)
  return fs.readFileSync(scriptPath, 'utf8')
}

function resolveScriptPath(rootDir: string, identifier: string) {
  let scriptPath = path.resolve(rootDir, identifier)
  if (scriptPath.slice(-3) !== '.js')
    scriptPath += '.js'
  return scriptPath
}

export function injectScriptTag(window: DOMWindow, scriptContent: string) {
  const scriptEL = window.document.createElement('script')
  scriptEL.textContent = scriptContent
  window.document.head.appendChild(scriptEL)
}

export function isRelative(id: string) {
  return id.startsWith('.')
}
