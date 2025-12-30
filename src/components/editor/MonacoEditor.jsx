import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

export default function MonacoEditor({
    value,
    language = "javascript",
    theme = "light",
    fontSize = 14,
    wordWrap = false,
    onChange
}) {
    const containerRef = useRef(null);
    const editorRef = useRef(null);
    const modelRef = useRef(null);

    // CREATE EDITOR (once)
    useEffect(() => {
        modelRef.current = monaco.editor.createModel(
            value || "// Write your code here...",
            language
        );

        editorRef.current = monaco.editor.create(containerRef.current, {
            model: modelRef.current,
            theme: theme === "dark" ? "vs-dark" : "vs",
            fontSize,
            padding: { top: 16, bottom: 16 },
            minimap: { enabled: true },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: wordWrap ? "on" : "off",
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
        });

        editorRef.current.onDidChangeModelContent(() => {
            onChange?.(editorRef.current.getValue());
        });

        return () => {
            modelRef.current?.dispose();
            editorRef.current?.dispose();
        };
    }, []);

    // UPDATE THEME / OPTIONS
    useEffect(() => {
        if (!editorRef.current) return;
        monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");
        editorRef.current.updateOptions({
            fontSize,
            wordWrap: wordWrap ? "on" : "off",
        });
    }, [theme, fontSize, wordWrap]);

    // 🔥 UPDATE LANGUAGE PROPERLY
    useEffect(() => {
        if (!modelRef.current) return;
        monaco.editor.setModelLanguage(modelRef.current, language);
    }, [language]);

    // UPDATE VALUE (external changes)
    useEffect(() => {
        if (!editorRef.current) return;
        if (editorRef.current.getValue() !== value) {
            editorRef.current.setValue(value || "");
        }
    }, [value]);

    return <div ref={containerRef} className="w-full h-full" />;
}
