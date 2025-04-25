import subprocess
import threading
import sys

# https://github.com/WASasquatch/was-node-suite-comfyui
def get_packages(versions=False):
  try:
    result = subprocess.check_output([sys.executable, '-m', 'pip', 'freeze'], stderr=subprocess.STDOUT)
    lines = result.decode().splitlines()
    return [line if versions else line.split('==')[0] for line in lines]
  except subprocess.CalledProcessError as e:
    print("An error occurred while fetching packages:", e.output.decode())
    return []

# https://github.com/ltdrdata/ComfyUI-Manager/blob/284e90dc8296a2e1e4f14b4b2d10fba2f52f0e53/__init__.py#L14
def handle_stream(stream, prefix):
  for line in stream:
    print(prefix, line, end="")

# https://github.com/Fannovel16/comfyui_controlnet_aux/blob/main/utils.py
def run_script(cmd, cwd='.'):
  process = subprocess.Popen(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)

  stdout_thread = threading.Thread(target=handle_stream, args=(process.stdout, ""))
  stderr_thread = threading.Thread(target=handle_stream, args=(process.stderr, "[!]"))

  stdout_thread.start()
  stderr_thread.start()

  stdout_thread.join()
  stderr_thread.join()

  return process.wait()

# https://github.com/Fannovel16/comfyui_controlnet_aux/blob/main/utils.py
def install_wakepy():
  try:
    import wakepy
    # print(f"wakepy has already been installed.")
    return True
  except:
    print(f"wakepy not found. start module installation.")
    try:
      run_script([sys.executable, '-s', '-m', 'pip', 'install', 'wakepy'])
      import wakepy
      print(f"wakepy installed successfully.")
      return True
    except:
      print(f"failed to install wakepy.")
      return False