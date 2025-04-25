import traceback
import atexit

from server import PromptServer
from aiohttp import web

wakeup = None

def activate_ss():
  global wakeup
  
  from wakepy import keep

  if wakeup == None:
    wakeup = keep.presenting()
    wakeup._activate()

    print(f'Prevent screen saver')
    return True
  else:
    print(f'Screen saver has already been prevented')
    return False

def deactivate_ss():
  global wakeup

  if wakeup != None:

    wakeup._deactivate()
    wakeup = None

    print(f'Allow screen saver')

    return True
  else:
    return False

@PromptServer.instance.routes.get("/shinich39/comfyui-prevent-sleep/prevent-screen-saver")
async def _prevent_ss(request):
  try:
    activate_ss()
    return web.Response(status=200)
  except Exception:
    print(traceback.format_exc())
    return web.Response(status=400)

@PromptServer.instance.routes.get("/shinich39/comfyui-prevent-sleep/allow-screen-saver")
async def _allow_ss(request):
  try:
    deactivate_ss()
    return web.Response(status=200)
  except Exception:
    print(traceback.format_exc())
    return web.Response(status=400)

# deactivate when closing comfyui
atexit.register(deactivate_ss)