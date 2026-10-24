import { useHotkeys } from 'react-hotkeys-hook'
import Dropdown from './dropdown/Dropdown'
import { useRef } from 'react';
import { postSlugs } from '../../service/api';

function File() {
    const inputRef = useRef<HTMLInputElement>(null);
    const openFile = () => {
        inputRef.current?.click();
    };

    async function handleFile(file: globalThis.File) {
        console.log("Importando:", file.name);
        const data = await postSlugs(file);

        localStorage.setItem("slugs", JSON.stringify(data));
    };

    const exportFile = () => {
        const data = localStorage.getItem("slugs");

        if (!data) {
            console.warn("Nenhum dado encontrado no localStorage.");
            return;
        }

        const blob = new Blob([data], {
            type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "slugs.json";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    useHotkeys("ctrl+i", openFile)
    useHotkeys("ctrl+shift+h", exportFile)

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".json,.txt"
                hidden
                onChange={(event) => {
                const arquivo = event.target.files?.[0];

                if (arquivo) {
                    handleFile(arquivo);
                }

                event.target.value = "";
                }}
            />
            <Dropdown
            label='File'
            actions={[{
                label: "Import",
                onClick: () => inputRef.current?.click(),
                shortcut: "Ctril + i"
            },
            {
                label: "Export",
                onClick: exportFile,
                shortcut: "Ctrl + Shift + E"
            }
            ]}
            />
        </>
    )
}

export default File
