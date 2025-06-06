import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { appendJSONLine, readJSON, getDataDir } from '@/lib/data/storage';
import fs from 'fs/promises';

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const event = await req.json();
  const eventsFile = path.join(getDataDir(), 'events', `${params.projectId}.jsonl`);
  const timestamped = { ...event, timestamp: new Date().toISOString() };
  await appendJSONLine(eventsFile, timestamped);
  return NextResponse.json({ status: 'logged' });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const eventsFile = path.join(getDataDir(), 'events', `${params.projectId}.jsonl`);
  try {
    const data = await fs.readFile(eventsFile, 'utf8');
    const events = data
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    return NextResponse.json({ events });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ events: [] });
    }
    throw err;
  }
}
