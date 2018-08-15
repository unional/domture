import { JSDOM, ConstructorOptions } from 'jsdom'
import MemoryFS = require('memory-fs')
import path = require('path')
import uniq = require('lodash.uniq')
import { unpartial } from 'unpartial'
import webpack = require('webpack')

import { WebpackDomtureConfig } from './config'
import { extendJSDOM } from './extendJSDOM'
import { Domture } from './interfaces'
import { log } from './log'
import { toVarID } from './support'
import { injectScriptTag, url, isRelative, preloadScripts, toNamespace } from './util'

export async function createWebpackDomture(config: WebpackDomtureConfig): Promise<Domture> {
  const dom = createWebpackJSDOM(config.html, config.jsdomConstructorOptions)
  mixWebpack(dom, config)
  extendJSDOM(dom, config)
  preloadScripts(dom, config.preloadScripts, config.rootDir)

  return dom as Domture
}

function createWebpackJSDOM(html = '', givenOptions: Partial<ConstructorOptions> = {}) {
  const options = unpartial<ConstructorOptions>(givenOptions, {
    url,
    runScripts: 'dangerously'
  })
  return new JSDOM(html, options)
}
function validateWebpackConfig(config: webpack.Configuration | undefined) {
  if (!config) return
  if (config.entry || config.output || config.devtool)
    throw new Error(`webpack config 'entry', 'output', 'devtool' are reserved`)
}

function mixWebpack(jsdom: JSDOM, config: WebpackDomtureConfig) {
  validateWebpackConfig(config.webpackConfig)

  const webpackOptions = config.webpackConfig || {}
  if (config.transpiler === 'typescript') {
    webpackOptions.devtool = 'source-map'
    if (webpackOptions.resolve && webpackOptions.resolve.extensions) {
      webpackOptions.resolve.extensions = uniq(webpackOptions.resolve.extensions.concat(['.ts', '.tsx', '.js', '.jsx']))
    }
    else
      webpackOptions.resolve = {
        ...webpackOptions.resolve,
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      }
    if (webpackOptions.module && webpackOptions.module['rules']) {
      webpackOptions.module['rules'].push({
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      })
    }
    else
      webpackOptions.module = {
        ...webpackOptions.module,
        rules: [{
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }]
      }
  }

  const memfs = new MemoryFS()
  const domture = jsdom as any
  domture.import = function (identifier: string) {
    const varID = toVarID(identifier)
    const filename = `${varID}.js`
    const filePath = `/${filename}`
    if (domture.window[varID])
      return Promise.resolve(domture.window[varID])

    return new Promise<string>((a, r) => {
      const compiler = webpack(getWebpackOptions())
      compiler.outputFileSystem = memfs as any
      compiler.run((err, stats) => {
        if (err) r(err)
        else if (stats.hasErrors()) r(stats.toJson().errors)
        else {
          if (stats.hasWarnings()) log.warn(stats.toJson().warnings)
          const content = memfs.readFileSync(filePath, 'utf8')
          a(content)
        }
      })
    }).then(source => {
      injectScriptTag(domture.window, source)
      let globalDomtureValue = domture.window[varID]
      if (typeof globalDomtureValue === 'object' && Object.keys(globalDomtureValue).length === 0) {
        const ns = toNamespace(identifier)
        const globalValue = domture.get(ns)
        if (globalValue !== undefined)
          globalDomtureValue = domture.window[varID] = globalValue
      }

      return globalDomtureValue
    })

    function getWebpackOptions() {
      webpackOptions.entry = config.transpiler === 'typescript' ?
        resolveTSID(config.rootDir, identifier) :
        resolveID(config.rootDir, identifier)
      webpackOptions.output = {
        path: '/',
        filename,
        library: varID
      }
      return webpackOptions
    }
  }
}

function resolveID(baseDir, id) {
  if (isRelative(id))
    return resolveRelative(baseDir, id)
  return id
}

function resolveTSID(baseDir, id) {
  // of course this does not work with '.tsx' file.
  // but...will fix it by then.
  if (isRelative(id))
    return resolveRelative(baseDir, id)
  return id
}

function resolveRelative(from: string, to: string) {
  const froms = path.resolve(from).split('/')
  const tos = to.split('/')
  while (tos[0].startsWith('.')) {
    if (tos[0] === '.')
      tos.shift()
    else if (tos[0] === '..') {
      froms.pop()
      tos.shift()
    }
    else
      break;
  }
  return froms.concat(tos).join('/')
}
