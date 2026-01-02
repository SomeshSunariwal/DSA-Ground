import IconButton from "../common/IconButton";

export default function Header({ theme, onToggleTheme }) {
    return (
        <header className="h-14 bg-light-panel dark:bg-dark-panel border border-light-border dark:border-dark-border rounded-xl flex items-center justify-between px-4 shadow z-20">

            {/* LEFT */}
            <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        D
                    </div>
                    <span className="font-bold text-lg tracking-tight hidden sm:block 
                                    text-gray-900 dark:text-gray-100">
                        DSA<span className="text-orange-500">Ground</span>
                    </span>
                </div>

                {/* Nav */}
                <nav className="hidden md:flex gap-1 bg-gray-100 dark:bg-[#111] p-1 rounded-lg">
                    {["Explore", "Problems", "Contest", "Discuss"].map((item, idx) => (
                        <button
                            key={item}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${idx === 1
                                ? "bg-white dark:bg-dark-panel shadow text-black dark:text-white"
                                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={onToggleTheme}
                    className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <i className={`fas ${theme === "light" ? "fa-moon" : "fa-sun"}`}></i>
                </button>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                    SS
                </div>
            </div>
        </header>
    );
}
