import { useState } from "react";
import { LayoutPopUp } from "../layoutPopUp";
import type {
  LayoutSection,
  TeleprompterLayout,
} from "../../lib/teleprompterLayout";
import Dropdown from "./dropdown/Dropdown";

type LayoutMenuProps = {
  layout: TeleprompterLayout;
  onLayoutChange: (next: TeleprompterLayout) => void;
};

function LayoutMenu({ layout, onLayoutChange }: LayoutMenuProps) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<LayoutSection>("font");

  function openSection(next: LayoutSection) {
    setSection(next);
    setOpen(true);
  }

  return (
    <>
      <Dropdown
        label="Layout"
        actions={[
          { label: "Fonte", onClick: () => openSection("font") },
          {
            label: "Tamanho da fonte",
            onClick: () => openSection("fontSize"),
          },
          {
            label: "Alinhamento",
            onClick: () => openSection("align"),
          },
          {
            label: "Cor de texto",
            onClick: () => openSection("colors"),
          },
        ]}
      />
      <LayoutPopUp
        open={open}
        section={section}
        value={layout}
        onChange={onLayoutChange}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export default LayoutMenu;
