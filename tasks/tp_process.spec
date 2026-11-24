# -*- mode: python ; coding: utf-8 -*-
# Build (a partir de tasks/):
#   pyinstaller tp_process.spec --noconfirm
#
# Empacota libvosk.dll (+ deps MinGW) em _MEIPASS/vosk/, ao lado do pacote.
# UPX desligado: comprimir essas DLLs quebra o carregamento no Windows.

from __future__ import annotations

from pathlib import Path

from PyInstaller.utils.hooks import collect_all

try:
    import vosk as _vosk
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "Pacote 'vosk' não encontrado neste Python. "
        "Instale as deps de tasks/tp_process e rode o PyInstaller nesse venv."
    ) from exc

_VOSK_DLL_NAMES = (
    "libvosk.dll",
    "libgcc_s_seh-1.dll",
    "libstdc++-6.dll",
    "libwinpthread-1.dll",
)

vosk_pkg_dir = Path(_vosk.__file__).resolve().parent
vosk_datas, vosk_binaries, vosk_hiddenimports = collect_all("vosk")

vosk_dll_binaries: list[tuple[str, str]] = []
missing: list[str] = []
for name in _VOSK_DLL_NAMES:
    src = vosk_pkg_dir / name
    if src.is_file():
        # Destino "vosk" => _MEIPASS/vosk/<dll> (mesmo dir do __init__.py)
        vosk_dll_binaries.append((str(src), "vosk"))
    else:
        missing.append(name)

if missing:
    raise SystemExit(
        "DLLs do Vosk ausentes em "
        f"{vosk_pkg_dir}: {', '.join(missing)}. "
        "Reinstale o pacote vosk (pip install --force-reinstall vosk)."
    )

a = Analysis(
    ["tp_process/main.py"],
    pathex=["."],
    binaries=list(vosk_binaries) + vosk_dll_binaries,
    datas=vosk_datas,
    hiddenimports=list(vosk_hiddenimports)
    + [
        "vosk",
        "vosk.vosk_cffi",
        "sounddevice",
        "cffi",
        "rapidfuzz",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=["tp_process/rthook_vosk.py"],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="tp_process",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
