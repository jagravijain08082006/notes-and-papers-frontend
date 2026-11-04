import "./press-animation.css";

/** A small printing press that turns out question papers. Decorative only: pure markup and CSS, no JavaScript. */
export function PressAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="press">
        <div className="sheet" />
        <div className="roll" />
        <div className="sheet" />
        <div className="roll" />
        <div className="sheet" />
        <div className="roll" />
        <div className="sheet" />
        <div className="sheet" />
        <div className="sheet" />
        <div className="sheet" />
        <div className="sheet" />
        <div className="roll" />
      </div>
    </div>
  );
}
