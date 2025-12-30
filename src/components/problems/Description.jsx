import { useEffect, useState } from "react";
import PanelCard from "../common/PanelCard";
import { useSelector } from "react-redux";
import { marked } from "marked";

export default function Description() {
    const [problem, setProblem] = useState(null);
    const fetchProblem = useSelector(state => state.problem.data);

    useEffect(() => {
        setProblem(fetchProblem);
    }, [fetchProblem]);

    const levelStyles = {
        Easy: "bg-green-100 text-green-700",
        Medium: "bg-yellow-100 text-yellow-700",
        Hard: "bg-red-100 text-red-700",
    };

    if (!problem) {
        return (
            <PanelCard>
                <div className="flex flex-col items-center justify-center p-8 gap-4">
                    <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-gray-400 text-sm">Loading problem...</span>
                </div>
            </PanelCard>
        );
    }

    return (
        <PanelCard>
            {/* Header */}
            <div className="p-4 border-b border-gray-700 space-y-2">
                <div className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    {problem.Serial}. {problem.ProblemName}
                </div>

                {/* Tags */}
                <div className="flex gap-2">
                    <span
                        className={`px-3 py-1 text-xs rounded-full font-medium
                        ${levelStyles[problem.Level] || "bg-gray-200 text-gray-700"}`}
                    >
                        {problem.Level}
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-800 text-gray-300">
                        {problem.Category}
                    </span>
                </div>
            </div>

            {/* MARKDOWN RENDER BOX */}
            <div
                className="p-6 prose dark:prose-invert max-w-none overflow-y-auto max-h-[70vh] text-gray-900 dark:text-gray-100"
                dangerouslySetInnerHTML={{
                    __html: marked.parse(problem.ProblemDescription),
                }}
            />
        </PanelCard>
    );
}
