import fileUrl = require('file-url')
import fs = require('fs')
import path = require('path')
import { DOMWindow } from 'jsdom'
import { trimFileExtension } from './support';

export const url = fileUrl(process.cwd()) + '/'

export function preloadScripts(dom, preloadScripts, rootDir) {
  if (preloadScripts) {
    preloadScripts.forEach(s => loadScriptSync(dom.window, rootDir, s))
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

export function getNamespace(root: any, path: string) {
  const nodes = path.split(/[.\/]/);

  let m = root[nodes[0]];
  for (let j = 1, len = nodes.length; j < len; j++) {
    if (!m) {
      break;
    }
    const node = nodes[j];
    m = m[node];
  }
  return m;
}
export function toNamespace(identifier: string) {
  let id = trimFileExtension(identifier)
  if (isRelative(identifier)) {
    // this is naive and only supprot './abc',
    // but that's probably all we need
    id = id.slice(2)
  }
  return id.replace(/\//g, '.')
}
