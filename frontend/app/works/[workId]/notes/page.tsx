type NotesPageProps = {
  params: Promise<{ workId: string }>;
};

export default async function NotesPage({ params }: NotesPageProps) {
  const { workId } = await params;
  return <main>Notes placeholder for {workId}</main>;
}
