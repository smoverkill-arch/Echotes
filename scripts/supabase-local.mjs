import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";

const PROJECT_ID = "Echotes";
const CONTAINER_NAME_PATTERN = /^supabase_.+_Echotes$/;
const LOCAL_PORTS = [55420, 55421, 55422, 55423, 55424, 55427, 55429];
const isWindows = process.platform === "win32";

const localSupabaseCommand = () => {
  const localSupabase = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    "supabase.CMD",
  );

  return existsSync(localSupabase) ? localSupabase : "supabase.cmd";
};

const resolveCommand = (command, args) => {
  if (!isWindows) {
    return { command, args };
  }

  if (command === "docker") {
    return { command: "docker.exe", args };
  }

  if (command === "supabase") {
    const script = `${localSupabaseCommand()} ${args.join(" ")}`;

    return { command: "cmd.exe", args: ["/d", "/c", script] };
  }

  return { command, args };
};

const run = (command, args, options = {}) => {
  const resolved = resolveCommand(command, args);

  return spawnSync(resolved.command, resolved.args, {
    encoding: "utf8",
    ...options,
  });
};

const runInherited = (command, args) =>
  run(command, args, {
    stdio: "inherit",
  });

const runCaptured = (command, args) =>
  run(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

const outputLines = (command, args) => {
  const result = runCaptured(command, args);

  if (result.status !== 0) {
    return [];
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const dockerContainerNames = () => {
  const byLabel = outputLines("docker", [
    "ps",
    "-a",
    "--filter",
    `label=com.supabase.cli.project=${PROJECT_ID}`,
    "--format",
    "{{.Names}}",
  ]);
  const allSupabaseNames = outputLines("docker", [
    "ps",
    "-a",
    "--format",
    "{{.Names}}",
  ]).filter((name) => CONTAINER_NAME_PATTERN.test(name));

  return Array.from(new Set([...byLabel, ...allSupabaseNames]));
};

const applyNoAutostart = () => {
  const names = dockerContainerNames();

  if (names.length === 0) {
    console.log("[supabase-local] No Echotes Supabase containers found.");
    return 0;
  }

  let failures = 0;
  console.log("[supabase-local] Setting restart policy to no:");

  for (const name of names) {
    const result = runInherited("docker", ["update", "--restart=no", name]);

    if (result.status !== 0) {
      failures += 1;
    }
  }

  return failures === 0 ? 0 : 1;
};

const stopResidualContainers = () => {
  const names = dockerContainerNames();

  if (names.length === 0) {
    console.log("[supabase-local] No Echotes Supabase containers remain.");
    return 0;
  }

  let failures = 0;
  console.log("[supabase-local] Stopping residual Echotes Supabase containers:");

  for (const name of names) {
    const result = runInherited("docker", ["stop", name]);

    if (result.status !== 0) {
      failures += 1;
    }
  }

  return failures === 0 ? 0 : 1;
};

const checkPort = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (error) => {
      resolve({ port, ok: false, detail: error.message });
    });

    server.once("listening", () => {
      server.close(() => {
        resolve({ port, ok: true, detail: "available" });
      });
    });

    server.listen(port, "0.0.0.0");
  });

const dockerRows = () => {
  const names = dockerContainerNames();

  if (names.length === 0) {
    return [];
  }

  return names.map((name) => {
    const inspect = outputLines("docker", [
      "inspect",
      "--format",
      "{{.Name}}|{{.State.Status}}|{{.HostConfig.RestartPolicy.Name}}",
      name,
    ])[0];
    const ps = outputLines("docker", [
      "ps",
      "-a",
      "--filter",
      `name=^/${name}$`,
      "--format",
      "{{.Ports}}",
    ])[0];

    const [containerName, status, restartPolicy] = (inspect ?? "").split("|");

    return {
      name: (containerName ?? name).replace(/^\//, ""),
      status: status ?? "unknown",
      restartPolicy: restartPolicy || "none",
      ports: ps || "-",
    };
  });
};

const publishedEchotesPorts = (rows) => {
  const ports = new Set();

  for (const row of rows) {
    for (const match of row.ports.matchAll(/:(\d+)->/g)) {
      ports.add(Number(match[1]));
    }
  }

  return ports;
};

const printDoctor = async () => {
  console.log("[supabase-local] Echotes local Supabase doctor");
  console.log("");
  console.log("Target ports:");

  const rows = dockerRows();
  const publishedPorts = publishedEchotesPorts(rows);
  const portResults = await Promise.all(LOCAL_PORTS.map((port) => checkPort(port)));
  for (const result of portResults) {
    if (publishedPorts.has(result.port)) {
      console.log(`- ${result.port}: ECHOTES (published by local stack)`);
      continue;
    }

    const state = result.ok ? "OK" : "BLOCKED";
    console.log(`- ${result.port}: ${state} (${result.detail})`);
  }

  console.log("");
  console.log("Containers:");

  if (rows.length === 0) {
    console.log("- none");
    return;
  }

  for (const row of rows) {
    console.log(
      `- ${row.name}: status=${row.status}, restart=${row.restartPolicy}, ports=${row.ports}`,
    );
  }
};

const start = async () => {
  const startResult = runInherited("supabase", ["start"]);

  if (startResult.error) {
    console.error(
      `[supabase-local] Failed to run supabase start: ${startResult.error.message}`,
    );
  }

  const policyResult = applyNoAutostart();
  await printDoctor();

  if (startResult.status !== 0) {
    process.exit(startResult.status ?? 1);
  }

  process.exit(policyResult);
};

const stop = () => {
  const stopResult = runInherited("supabase", ["stop"]);

  if (stopResult.error) {
    console.error(
      `[supabase-local] Failed to run supabase stop: ${stopResult.error.message}`,
    );
  }

  const residualResult = stopResidualContainers();

  if ((stopResult.status ?? 0) !== 0 && residualResult !== 0) {
    process.exit(1);
  }

  process.exit(0);
};

const main = async () => {
  const command = process.argv[2] ?? "doctor";

  switch (command) {
    case "start":
      await start();
      break;
    case "stop":
      stop();
      break;
    case "no-autostart":
      process.exit(applyNoAutostart());
      break;
    case "doctor":
      await printDoctor();
      break;
    default:
      console.error(
        "Usage: node scripts/supabase-local.mjs <start|stop|no-autostart|doctor>",
      );
      process.exit(1);
  }
};

await main();
