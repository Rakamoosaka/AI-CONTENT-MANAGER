import { EditorScreen } from "@/features/content/editor/EditorScreen";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ContentEditPage({ params }: Props) {
  const { id } = await params;
  return <EditorScreen articleId={id} />;
}
