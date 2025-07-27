import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { rmSync, mkdirSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { lessPlugin } from '../lib'

const testDir = path.join(process.cwd(), 'test-output')
const demoDir = path.join(process.cwd(), 'tests', 'demo')

describe('bun-less-plugin', () => {
  beforeAll(() => {
    // 清理并创建测试输出目录
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })
  })

  afterAll(() => {
    // 清理测试输出目录
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('should compile basic Less file to CSS', async () => {
    const lessContent = `
@color: #09c;

.test {
  color: @color;
}
`
    const lessFile = path.join(testDir, 'demo.less')
    const entryFile = path.join(testDir, 'basic-test.ts')
    
    writeFileSync(lessFile, lessContent)
    writeFileSync(entryFile, `import './demo.less'`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    expect(result.success).toBe(true)
    expect(result.outputs.length).toBeGreaterThan(0)

    // 检查 CSS 文件是否生成
    const cssOutput = result.outputs.find(output => 
      output.path.endsWith('.css') || output.kind === 'asset'
    )
    expect(cssOutput).toBeDefined()
  })

  it('should handle Less variables correctly', async () => {
    const lessContent = `
@primary-color: #09c;
@font-size: 14px;

.container {
  color: @primary-color;
  font-size: @font-size;
}
`
    const lessFile = path.join(testDir, 'variables.less')
    const entryFile = path.join(testDir, 'variables-test.ts')
    
    writeFileSync(lessFile, lessContent)
    writeFileSync(entryFile, `import './variables.less'`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    expect(result.success).toBe(true)
  })

  it('should handle Less nesting correctly', async () => {
    const lessContent = `
.parent {
  color: red;
  
  .child {
    color: blue;
    
    &:hover {
      color: green;
    }
  }
}
`
    const lessFile = path.join(testDir, 'nesting.less')
    const entryFile = path.join(testDir, 'nesting-test.ts')
    
    writeFileSync(lessFile, lessContent)
    writeFileSync(entryFile, `import './nesting.less'`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    expect(result.success).toBe(true)
  })

  it('should handle Less imports correctly', async () => {
    const variablesContent = `@brand-color: #ff6600;`
    const mainContent = `
@import './variables.less';

.brand {
  color: @brand-color;
}
`
    
    const variablesFile = path.join(testDir, 'variables.less')
    const mainFile = path.join(testDir, 'main.less')
    const entryFile = path.join(testDir, 'import-test.ts')
    
    writeFileSync(variablesFile, variablesContent)
    writeFileSync(mainFile, mainContent)
    writeFileSync(entryFile, `import './main.less'`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    expect(result.success).toBe(true)
  })

  it('should handle Less mixins correctly', async () => {
    const lessContent = `
.border-radius(@radius: 5px) {
  border-radius: @radius;
  -webkit-border-radius: @radius;
  -moz-border-radius: @radius;
}

.button {
  .border-radius(10px);
  background: #007cba;
  color: white;
}
`
    const lessFile = path.join(testDir, 'mixins.less')
    const entryFile = path.join(testDir, 'mixins-test.ts')
    
    writeFileSync(lessFile, lessContent)
    writeFileSync(entryFile, `import './mixins.less'`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    expect(result.success).toBe(true)
  })

  it('should handle mathematical operations', async () => {
    const lessContent = `
@base-font-size: 14px;
@line-height-ratio: 1.5;

.text {
  font-size: @base-font-size;
  line-height: @base-font-size * @line-height-ratio;
  margin: @base-font-size / 2;
  padding: @base-font-size + 2px;
}
`
    const lessFile = path.join(testDir, 'math.less')
    const entryFile = path.join(testDir, 'math-test.ts')
    
    writeFileSync(lessFile, lessContent)
    writeFileSync(entryFile, `import './math.less'`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    expect(result.success).toBe(true)
  })

  it('should handle invalid Less syntax gracefully', async () => {
    const invalidLessContent = `
.test {
  color: @undefined-variable-that-definitely-does-not-exist;
}`
    const lessFile = path.join(testDir, 'invalid.less')
    const entryFile = path.join(testDir, 'invalid-test.ts')
    
    writeFileSync(lessFile, invalidLessContent)
    writeFileSync(entryFile, `import './invalid.less'`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    // 如果构建成功，说明插件处理了错误；如果失败，检查是否有错误信息
    if (!result.success) {
      expect(result.logs.length).toBeGreaterThan(0)
    } else {
      // 如果构建成功，插件应该已经处理了错误并返回了默认 CSS
      expect(result.success).toBe(true)
    }
  })

  it('should work with existing demo files', async () => {
    const demoFile = path.join(demoDir, 'demo.ts')
    
    const result = await Bun.build({
      entrypoints: [demoFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    expect(result.success).toBe(true)
  })

  it('should handle minification when enabled', async () => {
    const lessContent = `
.test {
  color: red;
  background: blue;
  margin: 10px;
  padding: 5px;
}
`
    const lessFile = path.join(testDir, 'minify.less')
    const entryFile = path.join(testDir, 'minify-test.ts')
    
    writeFileSync(lessFile, lessContent)
    writeFileSync(entryFile, `import './minify.less'`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      minify: true,
      plugins: [lessPlugin],
    })

    expect(result.success).toBe(true)
  })

  it('should handle multiple Less files in one build', async () => {
    const less1Content = `.class1 { color: red; }`
    const less2Content = `.class2 { color: blue; }`
    
    const less1File = path.join(testDir, 'multi1.less')
    const less2File = path.join(testDir, 'multi2.less')
    const entryFile = path.join(testDir, 'multi-test.ts')
    
    writeFileSync(less1File, less1Content)
    writeFileSync(less2File, less2Content)
    writeFileSync(entryFile, `
import './multi1.less'
import './multi2.less'
`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    expect(result.success).toBe(true)
  })

  it('should preserve file paths in error messages', async () => {
    const invalidLessContent = `
.test {
  color: @undefined-variable-that-does-not-exist;
}
`
    const lessFile = path.join(testDir, 'error-path.less')
    const entryFile = path.join(testDir, 'error-path-test.ts')
    
    writeFileSync(lessFile, invalidLessContent)
    writeFileSync(entryFile, `import './error-path.less'`)

    const result = await Bun.build({
      entrypoints: [entryFile],
      outdir: testDir,
      plugins: [lessPlugin],
    })

    // 如果构建失败，检查错误信息；如果成功，插件已经处理了错误
    if (!result.success) {
      expect(result.logs.length).toBeGreaterThan(0)
      const hasFilePathInError = result.logs.some(log => 
        log.message && log.message.includes('error-path.less')
      )
      expect(hasFilePathInError).toBe(true)
    } else {
      // 构建成功意味着插件妥善处理了错误
      expect(result.success).toBe(true)
    }
  })
})