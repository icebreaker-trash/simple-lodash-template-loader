// import loader from '../src'
import * as path from 'path'
import { webpack, ModuleOptions } from 'webpack'
import MemoryFs from 'memory-fs'

function compile (rules: ModuleOptions['rules']) {
  const compiler = webpack({
    mode: 'development',
    context: __dirname,
    entry: './fixtures/basic.t.html',
    output: {
      path: __dirname,
      filename: 'bundle.js'
    },
    module: { rules }
  })

  compiler.outputFileSystem = new MemoryFs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)
      else {
        resolve(
          stats
            ?.toJson({ source: true })
            ?.modules?.find(({ name }) => name === './fixtures/basic.t.html')
            ?.source
        )
      }
    })
  })
}

describe('[Default]', () => {
  it('transforms file', async () => {
    const source = await compile([
      {
        test: /\.html$/,
        use: [
          {
            loader: path.resolve(__dirname, '..'),
            options: {}
          }
        ]
      }
    ])

    expect(source).toBeUndefined()
  })
})
