# bun-less-plugin

A Bun plugin for compiling .less files to CSS.

## Installation

```bash
bun add bun-less-plugin
```

## Usage

### Basic Setup

```typescript
import { lessPlugin } from 'bun-less-plugin'

// Configure Bun build
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  plugins: [lessPlugin],
})
```

### Import Less Files

Once the plugin is configured, you can import `.less` files directly in your TypeScript/JavaScript code:

```typescript
// Import Less file as CSS
import './styles.less'
```

## License

MIT
