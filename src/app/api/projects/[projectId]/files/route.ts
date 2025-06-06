import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { ensureDir, getDataDir } from '@/lib/data/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectDir = path.join(getDataDir(), 'projects', params.projectId);
  await ensureDir(projectDir);
  const files = await fs.readdir(projectDir);
  return NextResponse.json({ files });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { name, content } = await req.json();
  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }
  const projectDir = path.join(getDataDir(), 'projects', params.projectId);
  await ensureDir(projectDir);
  await fs.writeFile(path.join(projectDir, name), content || '');
  return NextResponse.json({ status: 'created' }, { status: 201 });
}
