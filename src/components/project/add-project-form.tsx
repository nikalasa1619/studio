"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddProjectForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState('');
  const create = async () => {
    if (!name.trim()) return;
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    setName('');
    onCreated?.();
  };
  return (
    <div className="flex gap-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
      <Button onClick={create}>Add</Button>
    </div>
  );
}
