import traceback

from server import PromptServer
from aiohttp import web

wakeup = None

def activate():
  global wakeup
  
  from wakepy import keep

  if wakeup == None:
    wakeup = keep.presenting()
    wakeup._activate()

    print(f'[comfyui-prevent-sleep] Prevent screen saver')
    return True
  else:
    print(f'[comfyui-prevent-sleep] Screen saver has already been prevented')
    return False

def deactivate():
  global wakeup

  if wakeup != None:

    wakeup._deactivate()
    wakeup = None

    print(f'[comfyui-prevent-sleep] Allow screen saver')

    return True
  else:
    return False

@PromptServer.instance.routes.get("/shinich39/comfyui-prevent-sleep/prevent-screen-saver")
async def _prevent(request):
  try:
    activate()
    return web.Response(status=200)
  except Exception:
    print(traceback.format_exc())
    return web.Response(status=400)

@PromptServer.instance.routes.get("/shinich39/comfyui-prevent-sleep/allow-screen-saver")
async def _allow(request):
  try:
    deactivate()
    return web.Response(status=200)
  except Exception:
    print(traceback.format_exc())
    return web.Response(status=400)