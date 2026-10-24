import Dropdown from './components/menu/dropdown/Dropdown'
import { useHotkeys } from 'react-hotkeys-hook'
import File from './components/menu/File';



function App() {
  function editarUsuario() {
    alert("AKMKAMDMA")
    console.log("Editando");
  }

  function excluirUsuario() {
    console.log("Excluindo");
  }

  useHotkeys('ctrl+shift+e', editarUsuario)
  useHotkeys('ctrl+shift+l', excluirUsuario)

  return (
    <>
      <div className='flex flex-row gap-5'>
        <Dropdown
        label='File'
        actions={[
          {
            label: "Editar",
            shortcut: "Ctrl + Shift + E",
            onClick: editarUsuario,
          },
          {
            label: "Excluir",
            shortcut: "Ctrl + Shift + L",
            onClick: excluirUsuario,
          },
        ]}
        />
        <Dropdown
        label='Settings'
        actions={[
          {
            label: "TEst",
            onClick: ()=>console.log("FUNFO")
          }
        ]}
        />
        <File/>
      </div>
    </>
  )
}

export default App
