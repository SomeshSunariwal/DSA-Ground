import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import MonacoEditor from "../editor/MonacoEditor";

export default function AddProblemModal({
    isOpen,
    theme,
    onClose,
    levels = [],
    categories = []
}) {
    const [previewMode, setPreviewMode] = useState(false);

    const [form, setForm] = useState({
        level: "",
        topic: "",
        name: "",
        description: "",
        language: "cpp",
        starterCode: ""
    });

    /* ================= TEST CASE STATE ================= */

    const emptyCase = { input: "", output: "" };

    const [sampleTestcases, setSampleTestcases] = useState([emptyCase]);
    const [testcases, setTestcases] = useState([emptyCase]);

    /* ================= HELPERS ================= */

    const update = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const updateTestcase = (type, index, key, value) => {
        const data = type === "sample"
            ? [...sampleTestcases]
            : [...testcases];

        data[index][key] = value;

        type === "sample"
            ? setSampleTestcases(data)
            : setTestcases(data);
    };

    const addTestcaseRow = (type) => {
        type === "sample"
            ? setSampleTestcases(prev => [...prev, { ...emptyCase }])
            : setTestcases(prev => [...prev, { ...emptyCase }]);
    };

    const removeTestcaseRow = (type, index) => {
        const setter = type === "sample" ? setSampleTestcases : setTestcases;
        setter(prev => prev.filter((_, i) => i !== index));
    };

    /* ================= ESC CLOSE ================= */

    useEffect(() => {
        if (!isOpen) return;
        const onEsc = e => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [isOpen]);

    /* ================= LOCK SCROLL ================= */

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto";
    }, [isOpen]);

    /* ================= DEFAULTS ================= */

    useEffect(() => {
        if (!isOpen) return;
        setForm(prev => ({
            ...prev,
            level: prev.level || levels[0] || "Easy",
            topic: prev.topic || categories[0] || "1.Array"
        }));
    }, [isOpen, levels, categories]);

    /* ================= STARTER CODE ================= */

    useEffect(() => {
        const code = {
            cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}",
            python: "def main():\n    pass\n\nif __name__ == \"__main__\":\n    main()",
            java: "class Main {\n    public static void main(String[] args) {\n        \n    }\n}",
            javascript: "function main() {\n    \n}\n\nmain();"
        };

        if (code[form.language]) {
            update("starterCode", code[form.language]);
        }
    }, [form.language]);

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div
                onClick={e => e.stopPropagation()}
                className="w-[1200px]
                            h-[60vh]
                            rounded-2xl
                            bg-white dark:bg-[#1e1e1e]
                            border border-gray-200 dark:border-gray-700
                            shadow-2xl
                            flex flex-col">
                <div className="flex-1 p-6 grid grid-cols-2 gap-6 overflow-hidden text-gray-900 dark:text-gray-100">


                    {/* ================= LEFT SECTION ================= */}
                    <div className="space-y-4 overflow-y-auto pr-2">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Add New Problem</h2>
                            <button onClick={onClose} className="opacity-60 hover:opacity-100">✕</button>
                        </div>

                        {/* Level & Topic */}
                        <div className="flex gap-3">
                            <select
                                value={form.level}
                                onChange={e => update("level", e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                            >
                                {levels.map(l => <option key={l}>{l}</option>)}
                            </select>

                            <select
                                value={form.topic}
                                onChange={e => update("topic", e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                            >
                                {categories.map(c => (
                                    <option key={c}>{c.split(".")[1]}</option>
                                ))}
                            </select>
                        </div>

                        {/* Name */}
                        <input
                            placeholder="Problem Name"
                            value={form.name}
                            onChange={e => update("name", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                        />

                        {/* Markdown */}
                        <div>
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => setPreviewMode(false)}
                                    className={`px-4 py-1 text-xs rounded-full border ${!previewMode ? "bg-indigo-600 text-white" : ""}`}
                                >
                                    Text
                                </button>
                                <button
                                    onClick={() => setPreviewMode(true)}
                                    className={`px-4 py-1 text-xs rounded-full border ${previewMode ? "bg-indigo-600 text-white" : ""}`}
                                >
                                    Preview
                                </button>
                            </div>

                            {!previewMode ? (
                                <textarea
                                    value={form.description}
                                    onChange={e => update("description", e.target.value)}
                                    className="w-full min-h-[200px] p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                />
                            ) : (
                                <div className="min-h-[200px] p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <ReactMarkdown>
                                        {form.description || "Nothing to preview..."}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        {/* Language */}
                        <select
                            value={form.language}
                            onChange={e => update("language", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                        >
                            <option value="cpp">C++</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                        </select>

                        <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 h-[380px]">
                            <MonacoEditor
                                height="100%"
                                theme={theme}
                                language={form.language}
                                value={form.starterCode}
                                onChange={v => update("starterCode", v || "")}
                                options={{
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 12, bottom: 16 }
                                }}
                            />
                        </div>


                    </div>

                    {/* ================= RIGHT SECTION – TEST CASES ================= */}
                    <div className="space-y-6 overflow-y-auto pr-2">

                        {/* SAMPLE TEST CASES */}
                        <div>
                            <h3 className="font-semibold mb-2">Sample Testcases</h3>

                            {sampleTestcases.map((tc, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <textarea
                                        placeholder="Input"
                                        value={tc.input}
                                        onChange={e => updateTestcase("sample", i, "input", e.target.value)}
                                        className="w-1/2 p-2 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                    />
                                    <textarea
                                        placeholder="Output"
                                        value={tc.output}
                                        onChange={e => updateTestcase("sample", i, "output", e.target.value)}
                                        className="w-1/2 p-2 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                    />
                                    <button
                                        onClick={() => removeTestcaseRow("sample", i)}
                                        className="text-red-500 px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => addTestcaseRow("sample")}
                                className="
                                            h-8
                                            px-3
                                            flex items-center justify-center
                                            rounded-md
                                            text-xs font-medium
                                            bg-indigo-50 text-indigo-700
                                            hover:bg-indigo-100
                                            active:scale-95
                                            transition
                                            dark:bg-indigo-900/30
                                            dark:text-indigo-300
                                            dark:hover:bg-indigo-900/50
                                        "
                            >
                                + Add Sample Testcase
                            </button>
                        </div>

                        <hr className="border-gray-300 dark:border-gray-700" />

                        {/* ACTUAL TEST CASES */}
                        <div>
                            <h3 className="font-semibold mb-2">Testcases</h3>

                            {testcases.map((tc, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <textarea
                                        placeholder="Input"
                                        value={tc.input}
                                        onChange={e => updateTestcase("real", i, "input", e.target.value)}
                                        className="w-1/2 p-2 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                    />
                                    <textarea
                                        placeholder="Output"
                                        value={tc.output}
                                        onChange={e => updateTestcase("real", i, "output", e.target.value)}
                                        className="w-1/2 p-2 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                    />
                                    <button
                                        onClick={() => removeTestcaseRow("real", i)}
                                        className="text-red-500 px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => addTestcaseRow("real")}
                                className="h-8
                                            px-3
                                            flex items-center justify-center
                                            rounded-md
                                            text-xs font-medium
                                            bg-indigo-50 text-indigo-700
                                            hover:bg-indigo-100
                                            active:scale-95
                                            transition
                                            dark:bg-indigo-900/30
                                            dark:text-indigo-300
                                            dark:hover:bg-indigo-900/50">
                                + Add Testcase
                            </button>
                        </div>

                    </div>

                </div>
                {/* Footer */}
                <div className="flex justify-end gap-3 p-3">
                    <button onClick={onClose}
                        className="h-10 min-w-[90px] flex items-center justify-center 
                        rounded-lg border text-sm font-medium transition bg-gray-100 
                        text-gray-900 hover:bg-gray-200 dark:bg-[#2a2a2a] 
                        dark:text-gray-200 dark:border-gray-700 dark:hover:bg-[#333333]">
                        Cancel
                    </button>


                    <button
                        className="h-10 min-w-[110px] flex items-center justify-center 
                        rounded-lg text-sm font-semibold text-white transition shadow-sm 
                        bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                        Add Problem
                    </button>
                </div>
            </div>
        </div>
    );
}
