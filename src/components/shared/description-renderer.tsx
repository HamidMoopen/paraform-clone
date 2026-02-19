"use client";

/** Renders role description with basic **bold** and newlines. */
export function DescriptionRenderer({ text }: { text: string }) {
  const parts = text.split(/\n\n+/);
  return (
    <div className="space-y-3 text-sm">
      {parts.map((paragraph, i) => (
        <p key={i} className="leading-relaxed">
          {paragraph.split(/(\*\*[^*]+\*\*)/g).map((segment, j) => {
            const bold = /^\*\*(.+)\*\*$/.exec(segment);
            if (bold) return <strong key={j}>{bold[1]}</strong>;
            return <span key={j}>{segment}</span>;
          })}
        </p>
      ))}
    </div>
  );
}
