# @marksharp/license

A CLI script to export and import the [MarkSharp](https://marketplace.visualstudio.com/items?itemName=jonathan-yeung.mark-sharp) VSCode extension license from the local VSCode storage.

## Requirements

- [Bun](https://bun.com) v1.0 or later

## Usage

Run directly without installation using `bun x`:

```bash
bun x github:gerardbalaoro/marksharp-license <command> [options]
```

### Commands

#### `export`

Reads the license from VSCode's local storage and prints an import command to stdout.

```bash
bun x github:gerardbalaoro/marksharp-license export
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--raw`, `-r` | Print only the raw encoded data to stdout |

#### `import`

Decodes and writes a license back into VSCode's local storage.

```bash
bun x github:gerardbalaoro/marksharp-license import <encoded-data>
```

The `<encoded-data>` argument is the base64-encoded, gzip-compressed license string produced by `export`.

## Development

Install dependencies:

```bash
bun install
```

Run locally:

```bash
bun run index.ts <command> [options]
```
