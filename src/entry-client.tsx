import { mount, StartClient } from "@solidjs/start/client";

mount(function () {
  return <StartClient />;
}, document.getElementById("app")!);
