"""
@author: shinich39
@title: comfyui-prevent-sleep
@nickname: comfyui-prevent-sleep
@version: 1.0.4
@description: Prevent sleep while running ComfyUI.
"""

import sys
import atexit
import signal
import os

from .py import install, wakeup

install.install_wakepy()

NODE_CLASS_MAPPINGS = {}

NODE_DISPLAY_NAME_MAPPINGS = {}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

# deactivate when closing comfyui

def on_close():
  wakeup.deactivate()
  sys.exit(0)
  
atexit.register(wakeup.deactivate)

if hasattr(signal, "SIGINT") == True:
  signal.signal(signal.SIGINT, on_close) # Ctrl + C

if hasattr(signal, "SIGTERM") == True:
  signal.signal(signal.SIGTERM, on_close) # kill PID

# win
if os.name == 'nt':
  try:
    install.install_win32api()

    import win32api
    
    win32api.SetConsoleCtrlHandler(on_close, True) # window terminal X button click
  except: 
    print("[comfyui-prevent-sleep] Error occurred in win32api")

# linux/mac
if hasattr(signal, "SIGNUP") == True:
  signal.signal(signal.SIGHUP, on_close)