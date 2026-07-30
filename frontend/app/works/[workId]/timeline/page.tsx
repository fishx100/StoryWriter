type TimelinePageProps = {
  params: Promise<{ workId: string }>;
};

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { workId } = await params;
  return <main>Timeline placeholder for {workId}</main>;
}
