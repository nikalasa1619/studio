import ProjectFiles from '@/components/project/project-files';
import ProjectEvents from '@/components/project/project-events';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Project: {projectId}</h1>
      <ProjectFiles projectId={projectId} />
      <ProjectEvents projectId={projectId} />
    </div>
  );
}
