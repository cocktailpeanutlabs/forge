module.exports = async (kernel) => {
  let script = {
    run: [{
      method: "shell.run",
      params: {
        message: [
          "git clone https://github.com/lllyasviel/stable-diffusion-webui-forge app",
        ]
      }
    }, {
     method: "fs.share",
     params: {
       drive: {
         checkpoints: "app/models/Stable-diffusion",
         vae: "app/models/VAE",
         loras: [
           "app/models/Lora",
           "app/models/LyCORIS"
         ],
         upscale_models: [
           "app/models/ESRGAN",
           "app/models/RealESRGAN",
           "app/models/SwinIR"
         ],
         embeddings: "app/embeddings",
         hypernetworks: "app/models/hypernetworks",
         controlnet: "app/models/ControlNet"
       },
       peers: [
         "https://github.com/cocktailpeanutlabs/comfyui.git",
         "https://github.com/cocktailpeanutlabs/fooocus.git",
         "https://github.com/cocktailpeanutlabs/automatic1111.git",
       ]
     }
   }, {
     method: "fs.share",
     params: {
       drive: {
         outputs: "app/outputs"
       }
     }
   }]
  }
  if (kernel.platform === "darwin" && kernel.arch === "x64") {
    script.run.push({
      "method": "fs.download",
      "params": {
        "uri": "https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_768-ema-pruned.safetensors?download=true",
        "dir": "app/models/Stable-diffusion"
      }
    })
  } else {
    script.run.push({
      "method": "self.set",
      "params": {
        "app/ui-config.json": {
          "txt2img/Width/value": 1024,
          "txt2img/Height/value": 1024,
        }
      }
    })
    script.run = script.run.concat([{
      "method": "fs.download",
      "params": {
        "url": "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors",
        "dir": "app/models/Stable-diffusion"
      }
    }, {
      "method": "fs.download",
      "params": {
        "url": "https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors",
        "dir": "app/models/Stable-diffusion"
      }
    }])
  }
  script.run = script.run.concat([{
    method: "shell.run",
    params: {
      message: "{{platform === 'win32' ? 'webui-user.bat' : 'bash webui.sh -f'}}",
      env: {
        SD_WEBUI_RESTARTING: 1,
      },
      path: "app",
      on: [{ "event": "/http:\/\/[0-9.:]+/", "kill": true }]
    }
  }, {
    method: "notify",
    params: {
      html: "Click the 'start' tab to launch the app"
    }
  }])
  if (kernel.platform === 'darwin') {
    script.requires = [{
      platform: "darwin",
      type: "conda",
      name: ["cmake", "protobuf", "rust", "wget"],
      args: "-c conda-forge"
    }]
  }
  return script
}