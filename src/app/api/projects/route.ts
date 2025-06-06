import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readJSON, writeJSON, ensureDir, getDataDir } from '@/lib/data/storage';

interface Project {
  id: string;
  name: string;
}

const projectsFile = path.join(getDataDir(), 'projects.json');

export async function GET() {
  const projects = await readJSON<Project[]>(projectsFile, []);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }
  const projects = await readJSON<Project[]>(projectsFile, []);
  const id = name.toLowerCase().replace(/\s+/g, '-');
  const newProject: Project = { id, name };
  await writeJSON(projectsFile, [...projects, newProject]);
  await ensureDir(path.join(getDataDir(), 'projects', id));
  return NextResponse.json(newProject, { status: 201 });
}
