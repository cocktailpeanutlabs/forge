module.exports = async (kernel) => {
  return {
    daemon: true,
    run: [{
      method: "shell.run",
      params: {
        path: "app",
        message: (kernel.platform === 'win32' ? 'webui-user.bat' : 'bash webui.sh -f'),
        env: { SD_WEBUI_RESTARTING: 1, PYTORCH_MPS_HIGH_WATERMARK_RATIO: 0 },
        on: [{ "event": "/http:\/\/[0-9.:]+/", "done": true }]
      }
    }, {
      method: "local.set",
      params: {
        "url": "{{input.event[0]}}",
      }
    }, {
      "method": "proxy.start",
      "params": {
        "uri": "{{local.url}}",
        "name": "Local Sharing"
      }
    }]
  }
}
