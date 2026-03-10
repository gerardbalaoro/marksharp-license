import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from 'bun:sqlite';

const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

const ItemKey = 'jonathan-yeung.mark-sharp';

type ItemValue = {
  [key: string]: unknown;
  'license-key': string;
  signature: string;
};

const getStoragePath = () => {
  if (isWindows) {
    return resolve(process.env.APPDATA!, 'Code', 'User', 'globalStorage');
  } else if (isMacOS) {
    return resolve(
      process.env.HOME!,
      'Library',
      'Application Support',
      'Code',
      'User',
      'globalStorage'
    );
  } else if (isLinux) {
    return resolve(
      process.env.HOME!,
      '.config',
      'Code',
      'User',
      'globalStorage'
    );
  }

  throw new Error('Unsupported platform');
};

const getDatabase = () => {
  const path = resolve(getStoragePath(), 'state.vscdb');

  if (!existsSync(path)) {
    throw new Error('state.vscdb file not found');
  }

  return new Database(path);
};

const validate = (value: unknown): value is ItemValue => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ItemValue)['license-key'] === 'string' &&
    typeof (value as ItemValue)['signature'] === 'string'
  );
};

export const getValue = () => {
  const db = getDatabase();
  const result = db
    .query('SELECT value FROM ItemTable WHERE key = $key')
    .get({ $key: ItemKey });

  if (!result) {
    throw new Error('License not found');
  }

  const value = JSON.parse((result as { value: string }).value);

  if (!validate(value)) {
    throw new Error('Invalid value format');
  }

  return value;
};

export const setValue = (value: ItemValue) => {
  const db = getDatabase();

  if (!validate(value)) {
    throw new Error('Invalid value format');
  }

  db.query('UPDATE ItemTable SET value = $value WHERE key = $key').run({
    $value: JSON.stringify(value),
    $key: ItemKey,
  });
};

export const encode = (input: ItemValue) => {
  const data = Buffer.from(JSON.stringify(input));
  const gzip = Bun.gzipSync(data);

  return Buffer.from(gzip).toString('base64');
};

export const decode = (input: string) => {
  try {
    const gzip = Buffer.from(input, 'base64');
    const data = Bun.gunzipSync(gzip);
    const value: unknown = JSON.parse(new TextDecoder().decode(data));

    return validate(value) ? value : undefined;
  } catch {
    return undefined;
  }
};
