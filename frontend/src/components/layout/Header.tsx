import File from "../menu/File";
import Settings from "../menu/Settings";

function Header() {
  return (
    <header className="flex items-center gap-5 border-b border-current/20 p-4">
      <File />
      <Settings />
    </header>
  )
}

export default Header
