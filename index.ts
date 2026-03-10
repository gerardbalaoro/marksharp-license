#!/usr/bin/env bun

import { parseArgs } from 'util';
import packageJson from './package.json' assert { type: 'json' };
import { getValue, setValue, encode, decode } from './lib.js';

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    raw: { type: 'boolean', short: 'r' },
  },
  strict: false,
  allowPositionals: true,
});

const command = positionals[0];
const repository = packageJson.name.replace(/^@/, '');

if (!command) {
  console.error(`Usage: ${repository} <export|import>`);
  process.exit(1);
}

switch (command) {
  case 'export': {
    const value = getValue();
    const data = encode(value);

    if (values.raw) {
      console.log(data);
    } else {
      console.log(
        `bun x github:${repository} import ${data}`
      );
    }

    break;
  }
  case 'import': {
    const data = positionals[1];

    if (!data) {
      console.error('Please provide a valid license data to import.');
      process.exit(1);
    }

    const value = decode(data);

    if (!value) {
      console.error('Invalid license data.');
      process.exit(1);
    }

    try {
      setValue(value);

      console.log(`License: ${value['license-key']}`);
      console.log(`Signature: ${value['signature']}`);
    } catch (error) {
      console.error('Failed to import license data:', error);
      process.exit(1);
    }

    break;
  }
  default:
    console.error(`Unknown command: ${command}. Use 'export' or 'import'.`);
    process.exit(1);
}
