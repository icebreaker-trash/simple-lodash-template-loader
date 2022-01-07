import type { TemplateOptions } from 'lodash'
import template from 'lodash.template'
import type * as webpack from 'webpack'

interface LoaderOptions extends TemplateOptions {
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
  const options = this.getOptions()

  const defaults: TemplateOptions = {
    escape: options.escape,
    evaluate: options.evaluate,
    imports: options.imports,
    interpolate: options.interpolate,
    sourceURL: options.sourceURL,
    variable: options.variable
  }

  const opt = Object.assign(
    {},
    defaults,
    options.callback?.call(this, contents)
  )
  return template(contents, opt)
}
