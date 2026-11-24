"""Prepara pasta vosk/ + PATH para libvosk.dll no bundle PyInstaller.

O pacote vosk faz dlopen de libvosk.dll no mesmo diretório de __file__
(_MEIPASS/vosk/). Este hook garante que as DLLs estejam lá e no PATH
antes de qualquer import.
"""

from __future__ import annotations

import os
import shutil
import sys
from pathlib import Path


_VOSK_DLLS = (
    "libvosk.dll",
    "libgcc_s_seh-1.dll",
    "libstdc++-6.dll",
    "libwinpthread-1.dll",
)


def _prepare_vosk_dlls() -> None:
    if not getattr(sys, "frozen", False):
        return
    base = getattr(sys, "_MEIPASS", None)
    if not base:
        return

    meipass = Path(base)
    vosk_dir = meipass / "vosk"
    vosk_dir.mkdir(parents=True, exist_ok=True)

    for dll_name in _VOSK_DLLS:
        dest = vosk_dir / dll_name
        if dest.is_file():
            continue
        candidates = [meipass / dll_name, *meipass.rglob(dll_name)]
        for src in candidates:
            if src.is_file() and src.resolve() != dest.resolve():
                try:
                    shutil.copy2(src, dest)
                    break
                except OSError:
                    continue

    path_prefix = str(vosk_dir)
    current_path = os.environ.get("PATH", "")
    if not current_path.lower().startswith(path_prefix.lower()):
        os.environ["PATH"] = path_prefix + os.pathsep + current_path

    if hasattr(os, "add_dll_directory"):
        for folder in (vosk_dir, meipass):
            if folder.is_dir():
                try:
                    os.add_dll_directory(str(folder))
                except OSError:
                    pass


_prepare_vosk_dlls()
