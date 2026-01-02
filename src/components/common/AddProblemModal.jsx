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
    const [language, setLanguage] = useState("cpp");

    /* ================= SINGLE SOURCE OF TRUTH ================= */

    const [form, setForm] = useState({
        Serial: Date.now(),
        Level: "",
        Category: "",
        ProblemName: "",
        ProblemDescription: "",
        SampleCode: {
            cpp: "// Write your C++ code here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}",
            python: "# Write your Python code here\n\ndef main():\n    # your code here\n    pass\n\nif __name__ == \"__main__\":\n    main()",
            java: "// Write your Java code here\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}",
            javascript: "// Write your JavaScript code here\n\nfunction main() {\n    // your code here\n}\n\nmain();"
        },
        SampleInput: [{ input: "0" }],
        SampleOutput: [{ output: "0" }],
        TestCaseInputs: [{ input: "0" }],
        TestCaseOutputs: [{ output: "0" }]
    });


    /* ================= ESC + SCROLL ================= */

    useEffect(() => {
        if (!isOpen) return;
        const esc = e => e.key === "Escape" && onClose();
        window.addEventListener("keydown", esc);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", esc);
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    /* ================= DEFAULT DROPDOWNS ================= */

    useEffect(() => {
        if (!isOpen) return;
        setForm(prev => ({
            ...prev,
            Level: prev.Level || levels[0] || "Easy",
            Category: prev.Category || categories[0] || "1.Array"
        }));
    }, [isOpen, levels, categories]);

    if (!isOpen) return null;

    /* ================= HELPERS ================= */

    const updateArray = (key, index, field, value) => {
        setForm(prev => {
            const arr = [...prev[key]];
            arr[index][field] = value;
            return { ...prev, [key]: arr };
        });
    };

    const addRow = (inputKey, outputKey) => {
        setForm(prev => ({
            ...prev,
            [inputKey]: [...prev[inputKey], { input: "" }],
            [outputKey]: [...prev[outputKey], { output: "" }]
        }));
    };

    const removeRow = (inputKey, outputKey, index) => {
        setForm(prev => ({
            ...prev,
            [inputKey]: prev[inputKey].filter((_, i) => i !== index),
            [outputKey]: prev[outputKey].filter((_, i) => i !== index)
        }));
    };

    const submitForm = () => {
        console.log("FINAL FORM DATA 👉", form);
    }

    return (
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div onClick={e => e.stopPropagation()} className="w-[1200px] h-[60vh] rounded-2xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col">

                <div className="flex-1 p-6 grid grid-cols-2 gap-6 overflow-hidden text-gray-900 dark:text-gray-100">

                    {/* ================= LEFT ================= */}
                    <div className="space-y-4 overflow-y-auto pr-2">

                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Add New Problem</h2>
                            <button onClick={onClose} className="opacity-60 hover:opacity-100">✕</button>
                        </div>

                        <div className="flex gap-3">
                            <select value={form.Level} onChange={e => setForm(p => ({ ...p, Level: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                                {levels.map(l => <option key={l}>{l}</option>)}
                            </select>

                            <select value={form.Category} onChange={e => setForm(p => ({ ...p, Category: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                                {categories.map(c => <option key={c}>{c.split(".")[1]}</option>)}
                            </select>
                        </div>

                        <input value={form.ProblemName} onChange={e => setForm(p => ({ ...p, ProblemName: e.target.value }))} placeholder="Problem Name" className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />

                        <div>
                            <div className="flex gap-2 mb-2">
                                <button onClick={() => setPreviewMode(false)} className={`px-4 py-1 text-xs rounded-full border ${!previewMode ? "bg-indigo-600 text-white" : ""}`}>Text</button>
                                <button onClick={() => setPreviewMode(true)} className={`px-4 py-1 text-xs rounded-full border ${previewMode ? "bg-indigo-600 text-white" : ""}`}>Preview</button>
                            </div>

                            {!previewMode ? (
                                <textarea value={form.ProblemDescription} onChange={e => setForm(p => ({ ...p, ProblemDescription: e.target.value }))} className="w-full min-h-[200px] p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
                            ) : (
                                <div className="min-h-[200px] p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <ReactMarkdown>{form.ProblemDescription || "Nothing to preview..."}</ReactMarkdown>
                                </div>
                            )}
                        </div>

                        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                            <option value="cpp">C++</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                        </select>

                        <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 h-[380px]">
                            <MonacoEditor
                                key={language}   // force remount on language switch
                                height="100%"
                                theme={theme}
                                language={language}
                                value={form.SampleCode[language] || ""}
                                onChange={(value) => {
                                    setForm(prev => ({
                                        ...prev,
                                        SampleCode: {
                                            ...prev.SampleCode,
                                            [language]: value ?? ""
                                        }
                                    }));
                                }}
                                options={{
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    padding: { top: 12, bottom: 16 }
                                }}
                            />
                        </div>


                    </div>

                    {/* ================= RIGHT ================= */}
                    <div className="space-y-6 overflow-y-auto pr-2">

                        <div>
                            <h3 className="font-semibold mb-2">Sample Testcases</h3>
                            {form.SampleInput.map((_, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <textarea value={form.SampleInput[i].input} onChange={e => updateArray("SampleInput", i, "input", e.target.value)} className="w-1/2 p-2 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
                                    <textarea value={form.SampleOutput[i].output} onChange={e => updateArray("SampleOutput", i, "output", e.target.value)} className="w-1/2 p-2 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
                                    <button onClick={() => removeRow("SampleInput", "SampleOutput", i)} className="text-red-500 px-2">✕</button>
                                </div>
                            ))}
                            <button onClick={() => addRow("SampleInput", "SampleOutput")} className="h-8 px-3 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50">+ Add Sample Testcase</button>
                        </div>

                        <hr className="border-gray-300 dark:border-gray-700" />

                        <div>
                            <h3 className="font-semibold mb-2">Testcases</h3>
                            {form.TestCaseInputs.map((_, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <textarea value={form.TestCaseInputs[i].input} onChange={e => updateArray("TestCaseInputs", i, "input", e.target.value)} className="w-1/2 p-2 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
                                    <textarea value={form.TestCaseOutputs[i].output} onChange={e => updateArray("TestCaseOutputs", i, "output", e.target.value)} className="w-1/2 p-2 text-xs rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
                                    <button onClick={() => removeRow("TestCaseInputs", "TestCaseOutputs", i)} className="text-red-500 px-2">✕</button>
                                </div>
                            ))}
                            <button onClick={() => addRow("TestCaseInputs", "TestCaseOutputs")} className="h-8 px-3 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50">+ Add Testcase</button>
                        </div>
                    </div>
                </div>

                {/* ================= FOOTER ================= */}
                <div className="flex justify-end gap-3 p-3">
                    <button onClick={onClose} className="h-10 min-w-[90px] flex items-center justify-center rounded-lg border bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-[#2a2a2a] dark:text-gray-200 dark:border-gray-700 dark:hover:bg-[#333333]">Cancel</button>
                    <button onClick={() => submitForm()} className="h-10 min-w-[110px] flex items-center justify-center rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">Add Problem</button>
                </div>
            </div>
        </div >
    );
}
