import { OperatorModeToggle } from "../OperatorModeToggle";
import { SpeechCaptureButton } from "../SpeechCaptureButton";
import File from "../menu/File";
import Settings from "../menu/Settings";

type HeaderProps = {
  listening: boolean;
  speechError: string | null;
  transcript: string;
  isSpeechSupported: boolean;
  onToggleCapture: () => void;
  operatorMode: boolean;
  onOperatorModeChange: (enabled: boolean) => void;
};

function Header({
  listening,
  speechError,
  transcript,
  isSpeechSupported,
  onToggleCapture,
  operatorMode,
  onOperatorModeChange,
}: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-5 border-b border-current/20 p-4">
      <File />
      <Settings />
      <SpeechCaptureButton
        listening={listening}
        error={speechError}
        transcript={transcript}
        isSupported={isSpeechSupported}
        onToggle={onToggleCapture}
      />
      <div className="ml-auto">
        <OperatorModeToggle
          enabled={operatorMode}
          onChange={onOperatorModeChange}
        />
      </div>
    </header>
  );
}

export default Header;
