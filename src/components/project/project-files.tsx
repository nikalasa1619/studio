"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProjectFiles({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const { user } = useAuth();

  const load = async () => {
    const res = await fetch(`/api/projects/${projectId}/files`);
    const data = await res.json();
    setFiles(data.files);
  };

  useEffect(() => { load(); }, [projectId]);

  const addFile = async () => {
    await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content })
    });
    await fetch(`/api/projects/${projectId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'add', file: name, user: user?.uid || 'anon' })
    });
    setName('');
    setContent('');
    load();
  };

  const viewFile = async (file: string) => {
    await fetch(`/api/projects/${projectId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view', file, user: user?.uid || 'anon' })
    });
    const res = await fetch(`/api/projects/${projectId}/files/${file}`);
    const text = await res.text();
    alert(text);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="File name" />
        <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" />
        <Button onClick={addFile}>Upload</Button>
      </div>
      <ul className="list-disc pl-4">
        {files.map(f => (
          <li key={f} className="cursor-pointer underline text-blue-600" onClick={() => viewFile(f)}>{f}</li>
        ))}
      </ul>
    </div>
  );
}
