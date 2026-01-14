import traceback

from server import PromptServer
from aiohttp import web

_keep = None
_wake = None

def initialize():
  global _keep

  if _keep is not None:
    return _keep

  try:
    from wakepy import keep
  except ModuleNotFoundError:
    return None

  _keep = keep

  print(f'[comfyui-prevent-sleep] wakepy instance created')

  return _keep

def activate(mode):
  global _wake

  keep = initialize()

  if keep is None:
    print(f'[comfyui-prevent-sleep] Failed to load wakepy')
    return
  
  if _wake is not None:

    if mode == "sleep" and _wake.name == "keep.running":
      # print(f'[comfyui-prevent-sleep] Already activated: {_wake.name}')
      return
    
    if mode == "screen_saver" and _wake.name == "keep.presenting":
      # print(f'[comfyui-prevent-sleep] Already activated: {_wake.name}')
      return
    
    deactivate()

  if mode == "sleep":
    _wake = keep.running(on_fail="warn")
    _wake._activate()
    print(f'[comfyui-prevent-sleep] Activated: {_wake.name}')

  if mode == "screen_saver":
    _wake = keep.presenting(on_fail="warn")
    _wake._activate()
    print(f'[comfyui-prevent-sleep] Activated: {_wake.name}')

def deactivate():
  global _keep, _wake

  if _keep is None:
    return

  if _wake is None:
    return
  
  print(f'[comfyui-prevent-sleep] Deactivated: {_wake.name}')
  _wake._deactivate()
  _wake = None

@PromptServer.instance.routes.post("/shinich39/comfyui-prevent-sleep/enable")
async def _enable(request):
  try:
    req = await request.json()
    mode = req.get("mode")
    activate(mode)
    return web.Response(status=200)
  except Exception:
    print(traceback.format_exc())
    return web.Response(status=400)

@PromptServer.instance.routes.post("/shinich39/comfyui-prevent-sleep/disable")
async def _disable(request):
  try:
    deactivate()
    return web.Response(status=200)
  except Exception:
    print(traceback.format_exc())
    return web.Response(status=400)