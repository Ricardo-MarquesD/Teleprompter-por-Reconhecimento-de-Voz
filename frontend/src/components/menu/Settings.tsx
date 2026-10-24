import { useHotkeys } from 'react-hotkeys-hook'
import Dropdown from './dropdown/Dropdown'

function Settings() {
    const micConfig = () => {

    }

    useHotkeys("ctrl+m", micConfig)

    return (
        <></>
    //<Dropdown/>
    )
}

export default Settings
