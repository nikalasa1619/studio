"use client";
import { useEffect, useState } from 'react';

interface Event {
  type: string;
  file?: string;
  user: string;
  timestamp: string;
}

export default function ProjectEvents({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<Event[]>([]);

  const load = async () => {
    const res = await fetch(`/api/projects/${projectId}/events`);
    const data = await res.json();
    setEvents(data.events);
  };

  useEffect(() => { load(); }, [projectId]);

  return (
    <div>
      <h3 className="font-semibold">Events</h3>
      <ul className="list-disc pl-4">
        {events.map((e, idx) => (
          <li key={idx}>{e.timestamp} - {e.type} {e.file ? `(${e.file})` : ''} by {e.user}</li>
        ))}
      </ul>
    </div>
  );
}
