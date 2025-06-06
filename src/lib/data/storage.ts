import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readJSON<T>(filePath: string, defaultData: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return defaultData;
    }
    throw err;
  }
}

export async function writeJSON(filePath: string, data: any): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function appendJSONLine(filePath: string, data: any): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const line = JSON.stringify(data) + '\n';
  await fs.appendFile(filePath, line);
}

export function getDataDir() {
  return dataDir;
}
