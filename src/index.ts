import type { TemplateOptions } from 'lodash'
import template from 'lodash.template'
import type * as webpack from 'webpack'
import * as loaderUtils from 'loader-utils'

interface LoaderOptions extends TemplateOptions {
  esModule?: boolean
  callback?: (
    this: webpack.LoaderContext<LoaderOptions>,
    contents: string
  ) => TemplateOptions
}

function getLegacyLoaderConfig (
  loaderContext: webpack.LoaderContext<LoaderOptions>,
  defaultConfigKey: string
): LoaderOptions {
  const options = loaderUtils.getOptions(loaderContext)
  const configKey = options ? options.config : defaultConfigKey
  if (configKey) {
    // @ts-ignore
    return Object.assign({}, options, loaderContext.options[configKey])
  }
  return options
}

export default function simpleLodashTemplateLoader (
  this: webpack.LoaderContext<LoaderOptions>,
  contents: string
) {
  this.cacheable && this.cacheable()
  let config: LoaderOptions =
    this.version === 2
      ? loaderUtils.getOptions(this)
      : getLegacyLoaderConfig(this, 'simpleLodashTemplateLoader')

  if (config === null) {
    // handle the cases in which loaderUtils.getOptions() returns null
    // see https://github.com/webpack/loader-utils#getoptions
    config = {}
  }
  const defaults: TemplateOptions = {
    escape: config.escape,
    evaluate: config.evaluate,
    imports: config.imports,
    interpolate: config.interpolate,
    sourceURL: config.sourceURL,
    variable: config.variable
  }
  // default `commonjs` for building error about using 'with' stament
  const esModule =
    typeof config.esModule !== 'undefined' ? config.esModule : false

  if (esModule && !config.variable) {
    throw new Error(`
        To support the 'esModule' option, the 'variable' option must be passed to avoid 'with' statements
        in the compiled template to be strict mode compatible. Please see https://github.com/lodash/lodash/issues/3709#issuecomment-375898111.
        To enable CommonJS, please set the 'esModule' option to false.
      `)
  }
  const opt = Object.assign({}, defaults, config.callback?.call(this, contents))

  return `${esModule ? 'export default' : 'module.exports ='} ${
    template(contents, opt).source
  };`
}
