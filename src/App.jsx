import { useEffect, useState } from "react";
import Header from "./components/layout/Header";
import ProblemList from "./components/problems/ProblemList";
import Description from "./components/problems/Description";
import CodeEditorPanel from "./components/editor/CodeEditorPanel";
import ResizableSplit from "./components/common/ResizableSplit";

export default function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );
  }, [theme]);

  return (
    <div className="h-screen w-screen flex flex-col bg-light-bg dark:bg-dark-bg p-3 gap-2">

      {/* ✅ HEADER */}
      <Header
        theme={theme}
        onToggleTheme={() =>
          setTheme(prev => (prev === "light" ? "dark" : "light"))
        }
      />

      {/* ✅ CONTENT */}
      <div className="flex-1 overflow-hidden">
        <ResizableSplit initialSizes={[15, 40, 45]}>
          <ProblemList />
          <Description />
          <CodeEditorPanel theme={theme} />
        </ResizableSplit>
      </div>
    </div>
  );
}
