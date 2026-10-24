import { useMemo, useState } from "react";
import Header from "./components/layout/Header";
import { OperatorModeToggle } from "./components/operator/OperatorModeToggle";
import { ProgramSidebar } from "./components/program/ProgramSidebar";
import { TeleprompterView } from "./components/teleprompter/TeleprompterView";
import { getProgramByName } from "./lib/slugsStorage";

function App() {
  const [transcript, setTranscript] = useState("");
  const [selectedProgramName, setSelectedProgramName] = useState<
    string | null
  >(null);
  const [manualMode, setManualMode] = useState(false);

  const selectedProgram = useMemo(
    () =>
      selectedProgramName
        ? getProgramByName(selectedProgramName) ?? null
        : null,
    [selectedProgramName],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <Header onTranscript={setTranscript} />
      <main className="flex min-h-0 flex-1 gap-4 p-4">
        <ProgramSidebar
          selected={selectedProgramName}
          onSelect={setSelectedProgramName}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <OperatorModeToggle
            enabled={manualMode}
            onChange={setManualMode}
          />
          <TeleprompterView
            program={selectedProgram}
            transcript={transcript}
            manualMode={manualMode}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
