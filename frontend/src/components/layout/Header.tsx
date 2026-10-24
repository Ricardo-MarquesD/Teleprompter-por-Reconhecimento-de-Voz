import { SpeechCaptureButton } from "../SpeechCaptureButton";
import File from "../menu/File";
import Settings from "../menu/Settings";

type HeaderProps = {
  onTranscript: (text: string) => void;
};

function Header({ onTranscript }: HeaderProps) {
  return (
    <header className="flex items-center gap-5 border-b border-current/20 p-4">
      <File />
      <Settings />
      <SpeechCaptureButton onTranscript={onTranscript} />
    </header>
  )
}

export default Header
