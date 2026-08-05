import { SelectionProvider } from "@/components/SelectionProvider";
import SelectionBar from "@/components/SelectionBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SelectionProvider>
      <div className="min-h-dvh pb-20">{children}</div>
      <SelectionBar />
    </SelectionProvider>
  );
}
