import { MessageSquare } from "lucide-react";

interface OrderNoteSectionProps {
  customerNote: string;
  onNoteChange: (note: string) => void;
}

export function OrderNoteSection({ customerNote, onNoteChange }: OrderNoteSectionProps) {
  return (
    <div className="bg-card border rounded-[0.65rem] p-[0.65rem] sm:p-[0.8125rem]">
      <h2 className="text-[0.73125rem] font-bold mb-[0.65rem] flex items-center gap-[0.325rem]">
        <MessageSquare className="h-[0.8125rem] w-[0.8125rem]" />
        Order Note (Optional)
      </h2>
      <textarea
        value={customerNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Add any special instructions or notes for your order..."
        className="w-full border rounded-[0.4875rem] p-[0.4875rem] bg-background text-foreground text-[0.56875rem] resize-none"
        rows={4}
      />
    </div>
  );
}
