import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeDisplayProps {
  urpcCode?: string | null;
  data?: any;
}

export function CodeDisplay({ urpcCode, data }: CodeDisplayProps) {
  return (
    <div>
      {urpcCode && (
        <div className="mt-2 p-2 bg-black/10 rounded text-xs font-mono">
          <div className="text-xs opacity-75">URPC Code:</div>
          <SyntaxHighlighter
            language="typescript"
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "12px",
              fontSize: "11px",
              background: "transparent",
              overflow: "auto",
            }}
            codeTagProps={{
              style: {
                background: "transparent",
              },
            }}
            showLineNumbers={false}
            showInlineLineNumbers={false}
            wrapLines={false}
            wrapLongLines={true}
          >
            {urpcCode}
          </SyntaxHighlighter>
        </div>
      )}
      {data && (
        <div className="mt-2 p-2 bg-black/10 rounded text-xs font-mono">
          <div className="text-xs opacity-75">Data:</div>
          <SyntaxHighlighter
            language="json"
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "12px",
              fontSize: "11px",
              background: "transparent",
              overflow: "auto",
            }}
            codeTagProps={{
              style: {
                background: "transparent",
              },
            }}
            showLineNumbers={false}
            showInlineLineNumbers={false}
            wrapLines={false}
            wrapLongLines={true}
          >
            {JSON.stringify(data, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
