import Editor from "@monaco-editor/react";

type Props = {
  code: string;
  setCode: (value: string) => void;
  language: string;
  canEdit: boolean;
};

export default function CodeEditor({
  code,
  setCode,
  language,
  canEdit,
}: Props) {
  return (
    <Editor
      key={canEdit ? "editable" : "readonly"}
      height="100%"
      value={code}
      language={language === "unknown" ? "plaintext" : language}
      theme="vs-dark"
      options={{
        readOnly: !canEdit,
        fontSize: 14,
        minimap: { enabled: true },
        automaticLayout: true,
        scrollBeyondLastLine: false,
      }}
      onChange={(value) => {
        if (!canEdit) return;
        if (typeof value === "string") {
          setCode(value);
        }
      }}
    />
  );
}
