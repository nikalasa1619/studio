import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getDataDir } from '@/lib/data/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string; fileName: string } }
) {
  const filePath = path.join(getDataDir(), 'projects', params.projectId, params.fileName);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return new NextResponse(content);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; fileName: string } }
) {
  const filePath = path.join(getDataDir(), 'projects', params.projectId, params.fileName);
  try {
    await fs.unlink(filePath);
    return NextResponse.json({ status: 'deleted' });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    throw err;
  }
}
