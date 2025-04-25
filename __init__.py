"""
@author: shinich39
@title: comfyui-prevent-sleep
@nickname: comfyui-prevent-sleep
@version: 1.0.0
@description: Prevent sleep while running ComfyUI.
"""

from .py import install, screen, sleep

install.install_wakepy()

NODE_CLASS_MAPPINGS = {}

NODE_DISPLAY_NAME_MAPPINGS = {}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]