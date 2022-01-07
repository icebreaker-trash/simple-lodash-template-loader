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
) {
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
  let config =
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
  const esModule =
    typeof config.esModule !== 'undefined' ? config.esModule : true
  const opt = Object.assign({}, defaults, config.callback?.call(this, contents))
  return `${esModule ? 'export default' : 'module.exports ='} ${
    template(contents, opt).source
  };`
}
