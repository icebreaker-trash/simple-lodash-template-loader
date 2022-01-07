import template from 'lodash.template'
import type * as webpack from 'webpack'
import type { TemplateOptions } from 'lodash.template'

interface LoaderOptions extends TemplateOptions {}

export default function rawLoader (
  this: webpack.LoaderContext<LoaderOptions>,
  contents: string
) {
  this.cacheable && this.cacheable()
  const options = this.getOptions()

  const json = JSON.stringify(contents)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

  return template(json, options)
}
