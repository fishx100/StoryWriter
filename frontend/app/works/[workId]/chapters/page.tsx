type ChaptersPageProps = {
  params: Promise<{ workId: string }>;
};

export default async function ChaptersPage({ params }: ChaptersPageProps) {
  const { workId } = await params;
  return <main>Chapters placeholder for {workId}</main>;
}
