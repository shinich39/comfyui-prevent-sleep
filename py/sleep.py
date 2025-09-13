import traceback

from server import PromptServer
from aiohttp import web

wakeup = None

def activate():
  global wakeup
  
  from wakepy import keep

  if wakeup == None:
    # prevent sleep
    wakeup = keep.running()
    wakeup._activate()

    print(f'[comfyui-prevent-sleep] Prevent sleep')
    return True
  else:
    # print(f'[comfyui-prevent-sleep] Sleep has already been prevented')
    return False

def deactivate():
  global wakeup

  if wakeup != None:

    wakeup._deactivate()
    wakeup = None

    print(f'[comfyui-prevent-sleep] Allow sleep')

    return True
  else:
    return False

@PromptServer.instance.routes.get("/shinich39/comfyui-prevent-sleep/prevent-sleep")
async def _prevent(request):
  try:
    activate()
    return web.Response(status=200)
  except Exception:
    print(traceback.format_exc())
    return web.Response(status=400)

@PromptServer.instance.routes.get("/shinich39/comfyui-prevent-sleep/allow-sleep")
async def _allow(request):
  try:
    deactivate()
    return web.Response(status=200)
  except Exception:
    print(traceback.format_exc())
    return web.Response(status=400)