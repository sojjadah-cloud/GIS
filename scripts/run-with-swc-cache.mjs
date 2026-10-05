// Points SWC's native-binding cache at an absolute path inside the project
// instead of the OS default user-cache dir. In some sandboxed Windows
// environments the default cache dir's inherited ACLs (AppContainer
// capability SIDs) make @swc/core's loader refuse to use it
// (ERR_SWC_NATIVE_CACHE). SWC requires this path to be absolute.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cacheDir = path.join(projectRoot, ".swc-cache");

const [, , cmd, ...args] = process.argv;

const child = spawn(cmd, args, {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, SWC_NATIVE_BINDING_CACHE: cacheDir },
});

child.on("exit", (code) => process.exit(code ?? 0));
