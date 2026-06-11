import { MessageSquare } from "lucide-react";

interface OrderNoteSectionProps {
  customerNote: string;
  onNoteChange: (note: string) => void;
}

export function OrderNoteSection({ customerNote, onNoteChange }: OrderNoteSectionProps) {
  return (
    <div className="bg-card border rounded-2xl p-4 sm:p-5">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Order Note (Optional)
      </h2>
      <textarea
        value={customerNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Add any special instructions or notes for your order..."
        className="w-full border rounded-xl p-3 bg-background text-foreground text-sm resize-none"
        rows={4}
      />
    </div>
  );
}
