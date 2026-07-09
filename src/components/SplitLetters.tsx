import { forwardRef } from "react";

/**
 * Splits a word into per-letter spans for letter-by-letter reveals.
 * Preserves the whole word to assistive tech via an accessible label,
 * hiding the decorative letters from the a11y tree.
 */
type Props = {
  text: string;
  className?: string;
  letterClassName?: string;
};

const SplitLetters = forwardRef<HTMLSpanElement, Props>(
  ({ text, className, letterClassName }, ref) => (
    <span ref={ref} className={className} aria-label={text} role="text">
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className={letterClassName}
          aria-hidden="true"
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {ch}
        </span>
      ))}
    </span>
  )
);

SplitLetters.displayName = "SplitLetters";
export default SplitLetters;
