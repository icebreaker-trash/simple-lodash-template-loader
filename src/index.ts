import type { TemplateOptions } from 'lodash'
import template from 'lodash.template'
import type * as webpack from 'webpack'
import { getOptions } from 'loader-utils'
interface LoaderOptions extends TemplateOptions {
  esModule?: boolean
  callback?: (
    this: webpack.LoaderContext<LoaderOptions>,
    contents: string
  ) => TemplateOptions
}

export default function simpleLodashTemplateLoader (
  this: webpack.LoaderContext<LoaderOptions>,
  contents: string
) {
  this.cacheable && this.cacheable()
  const options = this.getOptions ? this.getOptions() : getOptions(this) as LoaderOptions

  const defaults: TemplateOptions = {
    escape: options.escape,
    evaluate: options.evaluate,
    imports: options.imports,
    interpolate: options.interpolate,
    sourceURL: options.sourceURL,
    variable: options.variable
  }
  const esModule =
    typeof options.esModule !== 'undefined' ? options.esModule : true
  const opt = Object.assign(
    {},
    defaults,
    options.callback?.call(this, contents)
  )
  return `${esModule ? 'export default' : 'module.exports ='} ${
    template(contents, opt).source
  };`
}
