import { useMemo, useState } from "react";
import Header from "./components/layout/Header";
import { ProgramList } from "./components/ProgramList";
import { Teleprompter } from "./components/Teleprompter";
import { useScriptFollow } from "./hooks/useScriptFollow";
import { useSpeechCapture } from "./hooks/useSpeechCapture";
import { useSlugs } from "./hooks/useSlugs";
import {
  listScriptBlocks,
  type ScriptBlockItem,
} from "./lib/scriptModel";

function App() {
  const programs = useSlugs();
  const blocks = useMemo(() => listScriptBlocks(programs), [programs]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [operatorMode, setOperatorMode] = useState(false);

  const {
    status,
    error,
    transcript,
    clearTranscript,
    toggle,
    isSupported,
  } = useSpeechCapture();

  const selected = useMemo(
    () => blocks.find((item) => item.id === selectedId) ?? null,
    [blocks, selectedId],
  );

  const { lines, cursor, improvising } = useScriptFollow(
    selected?.block ?? null,
    transcript,
  );

  function handleSelect(item: ScriptBlockItem) {
    setSelectedId(item.id);
    clearTranscript();
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Header
        listening={status === "listening"}
        reconnecting={status === "reconnecting"}
        speechError={error}
        transcript={transcript}
        isSpeechSupported={isSupported}
        onToggleCapture={toggle}
        operatorMode={operatorMode}
        onOperatorModeChange={setOperatorMode}
      />

      <div className="flex min-h-0 flex-1">
        <ProgramList
          blocks={blocks}
          selectedId={selectedId}
          onSelect={handleSelect}
        />

        <main className="flex min-w-0 flex-1 items-center justify-center px-6 py-6 lg:px-10">
          <Teleprompter
            lines={lines}
            cursor={cursor}
            improvising={improvising}
            operatorMode={operatorMode}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
