import { createDomture } from './index'

createDomture({ rootDir: './fixtures/with-subfolder' })
  .then(domture => {
    return domture.import('./index')
      .then(foo => {
        console.log(foo)
      })
  })
.catch(err => err)
