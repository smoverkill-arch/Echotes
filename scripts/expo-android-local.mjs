import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const localPropertiesPath = path.join(projectRoot, "android", "local.properties");

function readSdkDir() {
  if (!existsSync(localPropertiesPath)) {
    return undefined;
  }

  const contents = readFileSync(localPropertiesPath, "utf8");
  const line = contents
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("sdk.dir="));

  if (!line) {
    return undefined;
  }

  return line
    .slice("sdk.dir=".length)
    .replace(/\\\\/g, "\\")
    .replace(/\\:/g, ":");
}

const sdkDir = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || readSdkDir();

if (!sdkDir) {
  console.error("Android SDK path not found. Set ANDROID_HOME or android/local.properties sdk.dir.");
  process.exit(1);
}

const platformTools = path.join(sdkDir, "platform-tools");
const adbPath = path.join(platformTools, process.platform === "win32" ? "adb.exe" : "adb");

if (!existsSync(adbPath)) {
  console.error(`adb not found at ${adbPath}. Check android/local.properties sdk.dir.`);
  process.exit(1);
}

const binName = process.platform === "win32" ? "expo.CMD" : "expo";
const expoBin = path.join(projectRoot, "node_modules", ".bin", binName);

const env = {
  ...process.env,
  ANDROID_HOME: sdkDir,
  ANDROID_SDK_ROOT: sdkDir,
  PATH: `${platformTools}${path.delimiter}${process.env.PATH ?? ""}`,
};

const forwardedArgs = process.argv.slice(2);

if (forwardedArgs[0] === "--") {
  forwardedArgs.shift();
}

const command = process.platform === "win32" ? "cmd.exe" : expoBin;
const args =
  process.platform === "win32"
    ? ["/d", "/s", "/c", expoBin, "run:android", ...forwardedArgs]
    : ["run:android", ...forwardedArgs];

const child = spawn(command, args, {
  cwd: projectRoot,
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
