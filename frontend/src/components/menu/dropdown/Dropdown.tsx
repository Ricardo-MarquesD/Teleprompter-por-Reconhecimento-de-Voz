import { useEffect, useRef, useState } from "react";

export type DropdownOption = {
  label: string;
  shortcut?: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

export type DropdownProp = {
  label?: string;
  actions: DropdownOption[];
  className?: string;
}

function Dropdown({label="button_test", actions, className}: DropdownProp) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left text-mf ${className}`}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {label}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 flex min-w-60 flex-col text-left border">
          {actions.map((action)=>(
            <button
            key={action.label}
            className={`flex w-full items-center justify-between px-4 py-1 text-left text-sf ${action != actions[actions.length-1] ? "border-b" : ""}`}
            onClick={()=>{
              action.onClick();
              setIsOpen(false);
            }}
            >
              <span>{action.label}</span>
              {action.shortcut && (
                <kbd className="text-xs">{action.shortcut}</kbd>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
