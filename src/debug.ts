import { createDomture } from './index'

createDomture({ rootDir: './fixtures/with-subfolder' })
  .then(domture => {
    return domture.import('./index')
      .then(foo => {
        console.info(foo)
      })
  })
.catch(err => err)
