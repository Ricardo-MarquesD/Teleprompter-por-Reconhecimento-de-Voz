# TeproG (Tauri 2)

Teleprompter guiado por voz. O React orquestra a UI; os sidecars `slug_process` e `tp_process` fazem importação de roteiro e reconhecimento/matching.

## Desenvolvimento

```bash
cd teprog
npm install
npm run tauri dev
```

Binários esperados em `src-tauri/binaries/`:

- `slug_process-<target-triple>.exe`
- `tp_process-<target-triple>.exe`

No Windows atual: `x86_64-pc-windows-msvc`.

Na subida o app spawna os sidecars, lê o JSON de bootstrap na stdout e fala com eles via plugin HTTP + WebSocket (`127.0.0.1`).

## Dados

Alinhados com `tasks/common/paths.py`:

- Roteiro: `%LOCALAPPDATA%\Squad42\TeproG\slug_script.json`
- Estilo: `%APPDATA%\Squad42\TeproG\config\config_style.json`
- Áudio: `%APPDATA%\Squad42\TeproG\config\config_device.json`
- Modelo Vosk: `%LOCALAPPDATA%\Squad42\TeproG\models\model-pt\`
