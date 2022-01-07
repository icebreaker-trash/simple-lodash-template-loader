// import loader from '../src'
import * as path from 'path'
import { webpack, ModuleOptions } from 'webpack'
import MemoryFs from 'memory-fs'
import { Module } from 'module'

const parentModule = module

function execute (code: string) {
  const resource = 'test.js'
  const module = new Module(resource, parentModule)
  // eslint-disable-next-line no-underscore-dangle
  // @ts-ignore
  module.paths = Module._nodeModulePaths(path.resolve(__dirname, './fixtures'))
  module.filename = resource

  // eslint-disable-next-line no-underscore-dangle
  // @ts-ignore
  module._compile(
    code, // `let __export__;${code};module.exports = __export__;`,
    resource
  )

  return module.exports
}

function compile (
  rules: ModuleOptions['rules']
): Promise<string | Buffer | undefined> {
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
            options: {
              esModule: false,
              a: 'test'
            }
          }
        ]
      }
    ])
    const result = execute(source as string)({ user: 'fred' })

    expect(result).toBe('hello fred!')
  })
})
