import React, { useEffect, useRef } from "react";
import { cn } from "fumadocs-ui/utils/cn";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import "highlight.js/styles/github-dark.css";

// Register only the languages we need
hljs.registerLanguage("typescript", typescript);

interface CodeHighlighterProps {
  code: string;
  language: string;
  classNames?: {
    pre?: string;
    code?: string;
  };
}

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
  code,
  language,
  classNames,
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <pre
      className={cn(
        "text-xs sm:text-sm overflow-auto font-mono",
        classNames?.pre
      )}
    >
      <code
        ref={codeRef}
        className={cn(
          `language-${language} block whitespace-pre`,
          classNames?.code
        )}
      >
        {code}
      </code>
    </pre>
  );
};

export default CodeHighlighter;
