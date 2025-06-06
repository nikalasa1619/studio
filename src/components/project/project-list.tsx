"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AddProjectForm from './add-project-form';

interface Project { id: string; name: string; }

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const load = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data.projects);
  };
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-4">
      <AddProjectForm onCreated={load} />
      <ul className="list-disc pl-4">
        {projects.map((p) => (
          <li key={p.id}>
            <Link className="text-blue-600 underline" href={`/projects/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
