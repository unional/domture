import camelCase = require('camel-case')

export function toVarID(identifier: string) {
  const id = trimFileExtension(identifier)
  return `__domture__${camelCase(id)}`
}

export function trimFileExtension(identifier: string) {
  const parts = identifier.split('/')
  const partsCount = parts.length - 1
  const lastPart = parts[partsCount]
  parts[partsCount] = removeFileExtensions(lastPart)
  return parts.join('/')
}

function removeFileExtensions(part: string) {
  const index = part.indexOf('.')
  return index >= 0 ? part.slice(0, index) : part
}
