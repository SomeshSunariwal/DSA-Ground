import PanelCard from "../common/PanelCard";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProblemListStart } from "../../data_store/problemList_store";
import { fetchProblemStart } from "../../data_store/problem_store";

export default function ProblemList() {

    const [searchText, setSearchText] = useState("");
    const [level, setLevel] = useState("");
    const [categoryFilterValue, setCategoryFilterValue] = useState("");
    const [selectedId, setSelectedId] = useState("");
    const [problemList, setProblemList] = useState(null);
    const problemListFromStore = useSelector(state => state.problemList.data);


    const difficultyOptions = Array.from(
        new Set(
            (problemListFromStore || []).map(item => item.difficulty)
        )
    );

    const categoryOptions = Array.from(
        new Set(
            (problemListFromStore || []).flatMap(item =>
                (item.categories || []).map(cat => cat.category)
            )
        )
    );

    /////////////////////////////////////////////
    ///////// Run at the time of page load ///////
    //////////////////////////////////////////////

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchProblemListStart());
    }, []);


    /////////////////////////////////////////////
    ///////// When problemListFromStore get updated ///////
    //////////////////////////////////////////////

    useEffect(() => {
        setProblemList(problemListFromStore);
    }, [problemListFromStore]);

    useEffect(() => {
        if (!problemListFromStore || problemListFromStore.length === 0) {
            setProblemList([]);
            return;
        }

        // Always start from ORIGINAL list
        const freshList = problemListFromStore.map(problem => {
            const { difficulty, categories } = problem;

            const freshCategory = categoryFilterValue.split(".")[1];

            // Level filter
            if (level && difficulty !== level) return null;

            const filteredCategories = categories?.map(cat => {
                const { category, problems } = cat;

                // Category filter
                if (freshCategory && category.split(".")[1] !== freshCategory) return null;

                const filteredProblems = problems?.filter(p =>
                    !searchText || p.name.toLowerCase().includes(searchText)
                );

                if (!filteredProblems || filteredProblems.length === 0) return null;

                return {
                    ...cat,
                    problems: filteredProblems
                };
            }).filter(Boolean);

            if (!filteredCategories || filteredCategories.length === 0) return null;

            return {
                ...problem,
                categories: filteredCategories
            };
        }).filter(Boolean);

        setProblemList(freshList);

    }, [problemListFromStore, searchText, level, categoryFilterValue]);


    /////////////////////////////////////////////
    ////// Add Function below only /////////////
    /////////////////////////////////////////////

    const SelectProblem = (problem, category, difficulty) => {
        setSelectedId(problem.id + "-" + category + "-" + difficulty);
        dispatch(fetchProblemStart({
            difficulty: difficulty,
            category: category,         // full category with prefix e.g. "1.Array"
            file: problem.file
        }));
    }

    const getKey = (id, category, difficulty) => {
        return id + "-" + category + "-" + difficulty;
    }

    /////////////////////////////////////////////
    ////// Filter Logic can be added here //////
    /////////////////////////////////////////////

    const searchFilter = (text) => {
        setSearchText(text.toLowerCase());
    };

    const levelFilter = (level) => {
        setLevel(level === "Difficulty" ? "" : level);
    };

    const categoryFilter = (category) => {
        setCategoryFilterValue(category === "Category" ? "" : category);
    };


    return (
        <PanelCard>
            <div className="p-4 border-b border-light-border dark:border-dark-border space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        Problems
                    </h2>
                </div>

                {/* SEARCH */}
                <div className="relative">
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>

                    <input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => searchFilter(e.target.value)}
                        className="
                                w-full
                                pl-11 pr-4 py-2.5
                                rounded-lg
                                text-sm
                                bg-white
                                text-gray-900
                                placeholder-gray-400
                                border border-gray-300
                                focus:outline-none
                                focus:ring-2 focus:ring-blue-300
                                dark:bg-gray-900
                                dark:text-gray-100
                                dark:placeholder-gray-500
                                dark:border-gray-700
                                dark:focus:ring-blue-500
                            "
                    />
                </div>

                {/* FILTERS */}
                <div className="flex gap-2">
                    <select
                        onChange={(e) => levelFilter(e.target.value)}
                        className="
                                    flex-1
                                    rounded-lg
                                    text-xs
                                    py-2 px-3
                                    bg-gray-100
                                    text-gray-900
                                    border border-gray-300
                                    focus:outline-none
                                    focus:ring-2 focus:ring-blue-300
                                    dark:bg-gray-900
                                    dark:text-gray-100
                                    dark:border-gray-700
                                    dark:focus:ring-blue-500
                                "
                    >
                        <option value="">Difficulty</option>
                        {difficultyOptions.map(level => (
                            <option key={level} value={level}>
                                {level}
                            </option>
                        ))}
                    </select>

                    <select
                        onChange={(e) => categoryFilter(e.target.value)}
                        className="
                                    flex-1
                                    rounded-lg
                                    text-xs
                                    py-2 px-3
                                    bg-gray-100
                                    text-gray-900
                                    border border-gray-300
                                    focus:outline-none
                                    focus:ring-2 focus:ring-blue-300
                                    dark:bg-gray-900
                                    dark:text-gray-100
                                    dark:border-gray-700
                                    dark:focus:ring-blue-500
                                "
                    >
                        <option value="">Category</option>
                        {categoryOptions.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.split(".")[1]}
                            </option>
                        ))}
                    </select>

                    <button
                        className="
                                w-10 h-10
                                rounded-lg
                                bg-blue-600 hover:bg-blue-700
                                text-white
                                flex items-center justify-center
                                shadow-md
                                transition-all
                                active:scale-95
                            "
                    >
                        <i className="fas fa-plus text-sm"></i>
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto p-2">
                {problemList !== null ? problemList.map(problem => {
                    const { difficulty, categories } = problem;
                    return categories !== null ? categories.map(cat => {
                        const { problems, category } = cat;
                        return problems !== null ? problems.map(catItem => (
                            < div
                                key={catItem.id}
                                onClick={() => SelectProblem(catItem, category, difficulty)}
                                className={`
                                group p-3 mb-1 rounded-lg cursor-pointer
                                transition-all duration-200
                                border border-transparent
                                ${selectedId === getKey(catItem.id, category, difficulty)
                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm"
                                        : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                    }
                               `}
                            >
                                {/* TITLE */}
                                <div className="flex justify-between items-start mb-1.5">
                                    <span
                                        className={`
                                            font-semibold text-sm truncate
                                            ${selectedId === getKey(catItem.id, category, difficulty)
                                                ? "text-blue-700 dark:text-blue-400"
                                                : "text-gray-800 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white"
                                            }
                                            `}
                                    >
                                        {catItem.name}
                                    </span>
                                </div>

                                {/* TAGS */}
                                <div className="flex gap-2 text-[10px] font-medium uppercase tracking-wider">
                                    {/* Difficulty */}
                                    <span
                                        className={`
                                        px-2 py-0.5 rounded-md
                                        ${difficulty === "Easy"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                                : difficulty === "Medium"
                                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                            }`}
                                    >
                                        {difficulty}
                                    </span>

                                    {/* Category */}
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md">
                                        {category}
                                    </span>
                                </div>
                            </div>
                        )) : <div>Loading 1...</div>;
                    }) : <div>Loading 2...</div>;
                }) : <div>Loading 3...</div>}
            </div>
        </PanelCard >
    );
}

// console.log(difficulty)
// console.log(category);
// console.log(catItem.id);
// console.log(catItem.name);
// console.log(catItem.file);

