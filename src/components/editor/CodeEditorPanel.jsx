import { useEffect, useState } from "react";
import PanelCard from "../common/PanelCard";
import MonacoEditor from "./MonacoEditor";
import ResizableSplit from "../common/ResizableSplit";
import { useDispatch, useSelector } from "react-redux";
import { fetchCodePrettierStart } from "../../data_store/code_prettier";
import { runAllTestCasesStart } from "../../data_store/run_all_testcase_store";


export default function CodeEditorPanel({ theme }) {
    const dispatch = useDispatch();

    const [code, setCode] = useState(`///Write your code here
#include <iostream>
using namespace std;
int main() {
    int a;
    int b, c;
    cin >> a >> b >> c;
    cout << a+b+c << endl;
    return 0; 
}
`);
    const [language, setLanguage] = useState("cpp");
    const [fontSize, setFontSize] = useState(14);
    const [intellisense, setIntellisense] = useState(false);
    const [wordWrap, setWordWrap] = useState(false);
    const [activeTab, setActiveTab] = useState("case");
    const [prettifyRequested, setPrettifyRequested] = useState(false);
    const [consoleLogs, setConsoleLogs] = useState([]);
    const [executionMode, setExecutionMode] = useState("run");
    // "run" | "submit"




    const codeResponse = useSelector((state) => state.codePrettier.data);
    const problem = useSelector((state) => state.problem.data);
    const { running, outputs } = useSelector(
        (state) => state.runAllTestCases
    );


    useEffect(() => {
        if (
            prettifyRequested &&
            codeResponse &&
            codeResponse.formattedCode
        ) {
            setCode(codeResponse.formattedCode);
            setPrettifyRequested(false); // reset after update
        }
    }, [codeResponse, prettifyRequested]);


    /// Monaco language mapping
    const languageMap = {
        cpp: "cpp",
        python: "python",
        java: "java",
        javascript: "javascript",
    };

    ////////////////////////////////////
    /////////// Code Prettier ///////////
    const makeCodePrettier = () => {
        // For simplicity, we'll just format JS code using Monaco's built-in formatter
        setPrettifyRequested(true);
        dispatch(fetchCodePrettierStart({
            language: languageMap[language], code: code
        }))
    }

    /////////////////////////////////////
    // Test Case Logic
    /////////////////////////////////////

    const [testCases, setTestCases] = useState([
        {
            id: 1,
            input: "0",
            expectedOutput: "0",
            actualOutput: "",
            success: "0",
            editable: false,
        },
    ]);

    useEffect(() => {
        if (!problem || !problem.SampleInput || !problem.SampleOutput) return;

        const generatedTestCases = problem.SampleInput.map((item, index) => ({
            id: index + 1,
            input: item.input || "",
            expectedOutput: problem.SampleOutput[index]?.output || "",
            actualOutput: "",
            success: "0",
            editable: false,
            isSample: true,
        }));

        if (!problem.SampleCode) return;

        setCode(problem.SampleCode[language] || code);
        setTestCases(generatedTestCases);
        setActiveCase(0);
    }, [problem]);

    useEffect(() => {
        if (!problem || !problem.SampleCode) return;
        setCode(problem.SampleCode[language] || code);
    }, [problem, language]);


    const [activeCase, setActiveCase] = useState(0);

    const addTestCase = () => {
        setTestCases([...testCases,
        {
            id: Date.now(),
            input: "",
            actualOutput: "",
            expectedOutput: "0",
            success: "0",
            editable: true,
            isSample: true,
        }]);
        setActiveCase(testCases.length);
    };

    const updateCase = (field, value) => {
        const copy = [...testCases];
        copy[activeCase][field] = value;
        setTestCases(copy);
    };

    const deleteTestCase = (idx) => {
        if (testCases.length === 1) return; // 🚫 at least 1 case

        setTestCases((prev) => {
            const updated = prev.filter((_, i) => i !== idx);

            // adjust active case safely
            if (activeCase >= updated.length) {
                setActiveCase(updated.length - 1);
            } else if (idx < activeCase) {
                setActiveCase(activeCase - 1);
            }

            return updated;
        });
    };


    /////////////////////////////////////
    // RunCode logic
    /////////////////////////////////////
    const runCode = () => {
        setExecutionMode("run");

        const visibleCases = testCases;

        dispatch(runAllTestCasesStart({
            testCases: visibleCases,
            language,
            code,
            mode: "local",
        }));
    };

    useEffect(() => {
        if (executionMode !== "run") return;
        if (!outputs.length) return;

        setTestCases(prev =>
            prev.map((tc, idx) => {
                const actual = (outputs[idx] || "").trim();
                const expected = (tc.expectedOutput || "").trim();

                let success = "0";
                if (actual && expected) {
                    success = actual === expected ? "1" : "2";
                }

                return {
                    ...tc,
                    actualOutput: actual,
                    success,
                };
            })
        );
    }, [outputs, executionMode]);


    /////////////////////////////////////
    // Submit Code logic
    /////////////////////////////////////
    const submitCode = () => {
        setExecutionMode("submit");
        setActiveTab("console");

        const submissionCases = [
            ...problem.TestCaseInputs.map((item, idx) => ({
                input: item.input,
                expectedOutput: problem.TestCaseOutputs[idx]?.output || "",
            }))
        ];

        setConsoleLogs([
            { type: "info", text: "Code Submitted." },
            { type: "info", text: "Executing test cases..." },
        ]);

        dispatch(runAllTestCasesStart({
            testCases: submissionCases,
            language,
            code,
            mode: "local",
        }));
    };

    useEffect(() => {
        if (executionMode !== "submit") return;
        if (!outputs.length || !problem?.TestCaseOutputs?.length) return;

        setConsoleLogs(() => {
            const logs = [
                { type: "info", text: "Code Submitted." },
                { type: "info", text: "Executing test cases..." },
            ];

            outputs.forEach((out, idx) => {
                if (!out) return;

                const expected =
                    problem.TestCaseOutputs[idx]?.output?.trim() || "";

                const actual = out.trim();

                const success = actual === expected;

                logs.push({
                    type: success ? "success" : "error",
                    text: `Running ${idx + 1}: ${success ? "Success ✔" : "Failed ✖"}`,
                });
            });

            // final status
            if (outputs.length === problem.TestCaseOutputs.length) {
                const hasFailure = outputs.some((out, i) => {
                    const expected =
                        problem.TestCaseOutputs[i]?.output?.trim() || "";
                    return out.trim() !== expected;
                });

                logs.push({
                    type: hasFailure ? "error" : "success",
                    text: hasFailure
                        ? "Status: Failed ❌"
                        : "Successfully ran all test cases ✔",
                });
            }

            return logs;
        });
    }, [outputs, executionMode, problem]);


    /////////////////////////////////////
    // Color of the test case button
    /////////////////////////////////////
    const getCaseColor = (tc, isActive) => {
        if (isActive) {
            // Active case always stronger color
            if (tc.success === "1") return "bg-green-500 text-white";
            if (tc.success === "2") return "bg-red-500 text-white";
            return "bg-blue-500 text-white"; // default
        }

        // Inactive cases
        if (tc.success === "1")
            return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";

        if (tc.success === "2")
            return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";

        // success === "0"
        return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
    };


    return (
        <ResizableSplit direction="vertical" initialSizes={[70, 30]}>

            {/* EDITOR */}
            <PanelCard >
                {/* Toolbar */}
                <div className="
                                h-12
                                flex items-center justify-between
                                px-4
                                border-b
                                border-gray-200 dark:border-gray-700
                                bg-white dark:bg-[#1e1e1e]">
                    {/* LEFT CONTROLS */}
                    <div className="flex items-center gap-4">

                        {/* Language Selector */}
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="
                                    text-xs font-medium
                                    px-3 py-1.5
                                    rounded-md
                                    bg-gray-100 text-gray-900
                                    border border-gray-300
                                    focus:outline-none
                                    dark:bg-[#2d2d2d] dark:text-gray-100 dark:border-gray-600
                                "
                        >
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                        </select>

                        {/* IntelliSense Toggle */}
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                            <span className="text-green-600 dark:text-green-400">🌿</span>
                            IntelliSense

                            <button
                                onClick={() => setIntellisense(!intellisense)}
                                className={`relative w-9 h-5 rounded-full transition
                                            ${intellisense ? "bg-green-500" : "bg-gray-400"}`}>
                                <span
                                    className={`
                                        absolute top-0.5
                                        w-4 h-4 bg-white rounded-full transition
                                        ${intellisense ? "left-4" : "left-1"}`} />
                            </button>
                        </div>

                        {/* Font Size Slider */}
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span className="text-sm font-semibold">A</span>
                            <input
                                type="range"
                                min="12"
                                max="24"
                                value={fontSize}
                                onChange={(e) => setFontSize(+e.target.value)}
                                className="accent-blue-500 h-1 w-20"
                            />
                        </div>
                    </div>

                    {/* RIGHT CONTROLS */}
                    <div className="flex items-center gap-3">

                        {/* Word Wrap */}
                        <button
                            onClick={() => setWordWrap(!wordWrap)}
                            className={`
                                        flex items-center gap-1
                                        text-xs font-medium
                                        px-3 py-1.5
                                        rounded-md
                                        border
                                        transition-all

                                        ${wordWrap ? `bg-blue-600
                                                    text-white
                                                    border-blue-600
                                                    hover:bg-blue-700` : `
                                                    bg-white
                                                    text-gray-700
                                                    border-gray-300
                                                    hover:text-blue-600
                                                    hover:border-blue-500
                                                    hover:bg-blue-50
                                                    dark:bg-[#2d2d2d]
                                                    dark:text-gray-200
                                                    dark:border-gray-600
                                                    dark:hover:text-blue-400
                                                    dark:hover:border-blue-500
                                                    dark:hover:bg-[#1f2a44]`}`}>
                            <i className="fas fa-align-left text-sm"></i>
                            <span>Wrap</span>
                        </button>

                        {/* Prettier */}
                        <button
                            onClick={() => makeCodePrettier()}
                            className="flex items-center gap-1
                                        text-xs font-medium
                                        px-3 py-1.5
                                        rounded-md
                                        border
                                        transition-all

                                        bg-white
                                        text-gray-700
                                        border-gray-300
                                        hover:text-blue-600
                                        hover:border-blue-500
                                        hover:bg-blue-50
                                        active:bg-blue-600
                                        active:text-white
                                        active:border-blue-600

                                        dark:bg-[#2d2d2d]
                                        dark:text-gray-200
                                        dark:border-gray-600
                                        dark:hover:text-blue-400
                                        dark:hover:border-blue-500
                                        dark:hover:bg-[#1f2a44]
                                        dark:active:bg-blue-600
                                        dark:active:text-white
                                        dark:active:border-blue-600
                                    " >
                            <i className="fas fa-magic"></i>
                            Prettier
                        </button>
                    </div>
                </div>


                {/* Monaco */}
                <div className="flex-1 overflow-hidden relative bg-white dark:bg-dark-panel">
                    <MonacoEditor
                        language={languageMap[language]}
                        theme={theme}
                        fontSize={fontSize}
                        wordWrap={wordWrap ? "on" : "off"}
                        value={code}
                        onChange={setCode}
                    />
                </div>
            </PanelCard>

            {/* CONSOLE / TEST CASES */}
            <PanelCard>

                {/* TABS */}
                <div className="shrink-0 flex items-center gap-6 px-4 h-12 border-b bg-gray-50 dark:bg-[#1e1e1e]">
                    <button
                        onClick={() => setActiveTab("case")}
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide pb-2 ${activeTab === "case"
                            ? "text-blue-600 border-b-2 border-blue-500"
                            : "text-gray-500"
                            }`}
                    >
                        <i className="fas fa-vial text-xs"></i>
                        Test Cases
                    </button>

                    <button
                        onClick={() => setActiveTab("console")}
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide pb-2 ${activeTab === "console"
                            ? "text-blue-600 border-b-2 border-blue-500"
                            : "text-gray-500"
                            }`}
                    >
                        <i className="fas fa-terminal text-xs"></i>
                        Console
                    </button>
                </div>

                {/* SCROLL AREA */}
                <div className="flex-1 overflow-y-auto px-4 py-4 pr-3">

                    {activeTab === "case" ? (
                        <>
                            {/* CASE SELECTOR */}
                            <div className="flex items-center gap-2 mb-5 flex-wrap">
                                {testCases.map((tc, idx) => (
                                    <div key={tc.id} className="relative">
                                        <button
                                            onClick={() => setActiveCase(idx)}
                                            className={`px-4 py-1.5 pr-6 rounded-lg text-xs font-semibold transition
                                                            ${getCaseColor(tc, activeCase === idx)}`}
                                        >
                                            Case {idx + 1}
                                        </button>

                                        {/* ❌ Delete */}
                                        {testCases.length > 1 && tc.editable && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // ⛔ prevent case switch
                                                    deleteTestCase(idx);
                                                }}
                                                className="absolute -top-1 -right-1
                                                            w-4 h-4
                                                            rounded-full
                                                            bg-gray-400 hover:bg-red-500
                                                            text-white text-[10px]
                                                            flex items-center justify-center
                                                            transition"
                                                title="Delete case"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* ➕ Add case */}
                                <button
                                    onClick={addTestCase}
                                    className="w-8 h-8 flex items-center justify-center
                                                rounded-lg border border-dashed
                                                text-gray-500 hover:text-blue-600
                                                hover:border-blue-400"
                                >
                                    +
                                </button>
                            </div>

                            {/* INPUT */}
                            <div className="mb-4">
                                <div className="text-[10px] font-bold tracking-widest text-gray-400 mb-1">
                                    INPUT
                                </div>
                                <textarea
                                    value={testCases[activeCase].input}
                                    onChange={(e) => updateCase("input", e.target.value)}
                                    className="w-full h-24
                                                resize-none
                                                px-3 py-2
                                                font-mono text-sm
                                                rounded-lg
                                                bg-white dark:bg-dark-bg
                                                text-gray-700 dark:text-gray-300
                                                border border-gray-200 dark:border-gray-700
                                                focus:outline-none focus:border-blue-500"/>
                            </div>

                            {/* OUTPUTS */}
                            {/* OUTPUTS */}
                            <div className="grid grid-cols-[3fr_2fr] gap-4">

                                {/* ACTUAL OUTPUT – 60% */}
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest text-gray-400 mb-1">
                                        ACTUAL OUTPUT
                                    </div>
                                    <textarea
                                        value={testCases[activeCase].actualOutput}
                                        disabled
                                        className="w-full h-20
                                                    px-3 py-2
                                                    font-mono text-sm
                                                    rounded-lg
                                                    bg-gray-50 dark:bg-[#1e1e1e]
                                                    border border-gray-200 dark:border-gray-700
                                                    text-gray-700 dark:text-gray-300
                                                    focus:outline-none"
                                    />
                                </div>

                                {/* EXPECTED OUTPUT – 40% */}
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest text-gray-400 mb-1">
                                        EXPECTED OUTPUT
                                    </div>
                                    <textarea
                                        value={testCases[activeCase].expectedOutput || ""}
                                        disabled={!testCases[activeCase].editable}
                                        onChange={(e) => updateCase("expectedOutput", e.target.value)}
                                        className="w-full h-20
                                                    px-3 py-2
                                                    font-mono text-sm
                                                    rounded-lg
                                                    bg-gray dark:bg-[#1e1e1e]
                                                    border border-gray-200 dark:border-gray-700
                                                    text-gray-700 dark:text-gray-300
                                                    focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        (
                            <div className="font-mono text-sm space-y-2">
                                {consoleLogs.map((log, idx) => (
                                    <div
                                        key={idx}
                                        className={
                                            log.type === "success"
                                                ? "text-green-500"
                                                : log.type === "error"
                                                    ? "text-red-500"
                                                    : "text-gray-400"
                                        }
                                    >
                                        {log.text}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {/* ACTIONS */}
                <div className="shrink-0 h-14 px-4 border-t flex items-center justify-between bg-gray-50 dark:bg-[#1e1e1e]">
                    <button
                        onClick={runCode}
                        disabled={running}
                        className={`
                            px-5 py-2
                            rounded-lg
                            text-sm font-semibold
                            flex items-center gap-2
                            ${running
                                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            }
                            `}
                    >
                        {running && (
                            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                        )}
                        Run Code
                    </button>

                    <button
                        disabled={running}
                        onClick={submitCode}
                        className={`
                                    px-8 py-2
                                    rounded-lg
                                    text-sm font-semibold
                                    flex items-center gap-2
                                    ${running
                                ? "bg-green-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }
                                    text-white
                                `}
                    >
                        Submit
                        <i className="fas fa-paper-plane text-xs"></i>
                    </button>
                </div>

            </PanelCard>


        </ResizableSplit>
    );
}
