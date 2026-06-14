interface OrderNoteSectionProps {
  customerNote: string;
  onNoteChange: (note: string) => void;
}

export function OrderNoteSection({ customerNote, onNoteChange }: OrderNoteSectionProps) {
  return (
    <div className="bg-card border rounded-[0.65rem] p-[0.8125rem]">
      <h2 className="text-[13px] font-bold mb-[0.65rem]">Order Note <span className="text-[11px] text-muted-foreground font-normal">(Optional)</span></h2>
      <textarea
        value={customerNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Add any special instructions or notes for your order..."
        className="w-full border border-input rounded-[0.325rem] px-[0.65rem] sm:px-[0.4875rem] py-[0.4875rem] bg-background text-foreground text-[13px] sm:text-[11px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
        rows={3}
      />
    </div>
  );
}
