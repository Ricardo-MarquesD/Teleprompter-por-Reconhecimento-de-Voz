import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { AudioInputSettings } from "../microfonePopUp";
import Dropdown from "./dropdown/Dropdown";

function Settings() {
    const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);

    const openAudioSettings = () => setAudioSettingsOpen(true);

    useHotkeys("ctrl+m", openAudioSettings);

    return (
        <>
            <Dropdown
                label="Configurações"
                actions={[
                    {
                        label: "Entradas de áudio",
                        shortcut: "Ctrl + M",
                        onClick: openAudioSettings,
                    },
                ]}
            />
            <AudioInputSettings
                open={audioSettingsOpen}
                onClose={() => setAudioSettingsOpen(false)}
            />
        </>
    );
}

export default Settings
