import { useState } from "react";
import PanelCard from "../common/PanelCard";
import MonacoEditor from "./MonacoEditor";
import ResizableSplit from "../common/ResizableSplit";
import * as monaco from "monaco-editor";
import { useDispatch, useSelector } from "react-redux";
import { fetchCodePrettierStart } from "../../data_store/code_prettier";


export default function CodeEditorPanel({ theme }) {
    const dispatch = useDispatch();

    const [code, setCode] = useState(`
# Write your code here
#include <iostream>
using namespace std;
int main() {
cout << "Hello, World!" << endl;
return 0;
}
`);
    const [language, setLanguage] = useState("cpp");
    const [fontSize, setFontSize] = useState(14);
    const [intellisense, setIntellisense] = useState(false);
    const [wordWrap, setWordWrap] = useState(false);
    const [activeTab, setActiveTab] = useState("case");

    const codeResponse = useSelector((state) => state.codePrettier);
    console.log(codeResponse);



    ///// Test Cases State /////
    const [testCases, setTestCases] = useState([
        { id: 1, input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }
    ]);
    const [activeCase, setActiveCase] = useState(0);


    /// Monaco language mapping
    const languageMap = {
        cpp: "cpp",
        python: "python",
        java: "java",
        javascript: "javascript",
    };

    monaco.languages.register({ id: "cpp" });

    const updateCase = (field, value) => {
        const copy = [...testCases];
        copy[activeCase][field] = value;
        setTestCases(copy);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { id: Date.now(), input: "", output: "" }]);
        setActiveCase(testCases.length);
    };

    const makeCodePrettier = () => {
        // For simplicity, we'll just format JS code using Monaco's built-in formatter
        dispatch(fetchCodePrettierStart({
            language: languageMap[language], code: code
        }))
    }


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
                            <div className="flex items-center gap-2 mb-5">
                                {testCases.map((tc, idx) => (
                                    <button
                                        key={tc.id}
                                        onClick={() => setActiveCase(idx)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${activeCase === idx
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                                            }`}
                                    >
                                        Case {idx + 1}
                                    </button>
                                ))}

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
                                    className="
                                                w-full h-24
                                                px-3 py-2
                                                font-mono text-sm
                                                rounded-lg
                                                bg-white dark:bg-dark-bg
                                                border border-gray-200 dark:border-gray-700
                                                focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* OUTPUT */}
                            <div>
                                <div className="text-[10px] font-bold tracking-widest text-gray-400 mb-1">
                                    EXPECTED OUTPUT
                                </div>
                                <textarea
                                    value={testCases[activeCase].output}
                                    onChange={(e) => updateCase("output", e.target.value)}
                                    className="w-full h-20
                                                px-3 py-2
                                                font-mono text-sm
                                                rounded-lg
                                                bg-white dark:bg-dark-bg
                                                border border-gray-200 dark:border-gray-700
                                                focus:outline-none focus:border-blue-500
                                                "
                                />
                            </div>
                        </>
                    ) : (
                        <div className="font-mono text-sm text-gray-500">
                            Console ready...
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="shrink-0 h-14 px-4 border-t flex items-center justify-between bg-gray-50 dark:bg-[#1e1e1e]">
                    <button className="
                            px-5 py-2
                            rounded-lg
                            text-sm font-semibold
                            bg-gray-200 dark:bg-gray-700
                            text-gray-700 dark:text-gray-200
                            ">
                        Run Code
                    </button>

                    <button className="
                            px-8 py-2
                            rounded-lg
                            text-sm font-semibold
                            bg-green-600 hover:bg-green-700
                            text-white
                            flex items-center gap-2
                            ">
                        Submit
                        <i className="fas fa-paper-plane text-xs"></i>
                    </button>
                </div>

            </PanelCard>


        </ResizableSplit>
    );
}
