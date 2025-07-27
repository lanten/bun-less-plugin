import type { BunPlugin } from 'bun'
import less from 'less'
import fs from 'fs'
import path from 'path'

/**
 * Bun plugin for compiling .less files to CSS
 */
export const lessPlugin: BunPlugin = {
  name: 'less-loader',
  setup(build) {
    build.onLoad({ filter: /\.less$/ }, async (args) => {
      try {
        const lessContent = fs.readFileSync(args.path, 'utf8')

        const options = {
          filename: args.path,
          paths: [path.dirname(args.path)],
          compress: Boolean(build.config.minify),
        }

        const result = await less.render(lessContent, options)

        return {
          contents: result.css,
          loader: 'css' as const,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return {
          errors: [
            {
              text: `Less compilation failed: ${message}`,
              location: { file: args.path, line: 0, column: 0 },
            },
          ],
          contents: '',
          loader: 'css' as const,
        }
      }
    })
  },
}

export default lessPlugin
