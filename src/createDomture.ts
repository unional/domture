import { unpartial } from 'unpartial'

import { WebpackDomtureConfig, SystemJSDomtureConfig, defaultConfig } from './config'
import { Domture, SystemJSDomture } from './interfaces'
import { createWebpackDomture } from './createWebpackDomture'
import { createSystemJSDomture } from './createSystemJSDomture';

export async function createDomture(givenConfig?: Partial<WebpackDomtureConfig>): Promise<Domture>
export async function createDomture(givenConfig?: Partial<SystemJSDomtureConfig>): Promise<SystemJSDomture>
export async function createDomture(givenConfig: Partial<SystemJSDomtureConfig> | Partial<WebpackDomtureConfig> = {}): Promise<SystemJSDomture | Domture> {
  const config = unpartial(defaultConfig, givenConfig)
  return config.loader === 'webpack' ?
    createWebpackDomture(config) :
    createSystemJSDomture(config)
}
