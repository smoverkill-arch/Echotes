# Runbooks

## Bootstrap a New Local Environment

1. `corepack pnpm install`
2. create `.env` from `.env.example`
3. fill `EXPO_PUBLIC_SUPABASE_URL`
4. fill `EXPO_PUBLIC_SUPABASE_ANON_KEY`
5. start the local Supabase stack with `corepack pnpm run supabase:start`
6. confirm local migrations with `corepack pnpm run db:migrations`
7. `corepack pnpm expo start`

## Run Supabase Locally with Docker

1. start Docker Desktop
2. run `corepack pnpm run supabase:start`
3. open Supabase Studio at `http://127.0.0.1:55423`
4. use the local API URL `http://127.0.0.1:55421` when testing against the
   local stack
5. run `corepack pnpm run supabase:doctor` to inspect ports, containers and
   restart policies
6. run `corepack pnpm run supabase:stop` when the local stack is no longer
   needed

The local Postgres port is `55422`, with shadow DB on `55420`. The wrapper used
by `supabase:start` applies `docker update --restart=no` to Echotes Supabase
containers after the Supabase CLI starts them. Docker Desktop should not start
the Echotes stack automatically after this policy is applied.

The wrapper also requests the dedicated Docker network
`echotes_supabase_localhost`, configured to bind published ports to
`127.0.0.1`. Docker Desktop can still publish Supabase CLI ports on
`0.0.0.0`; when that happens, `supabase:doctor` reports the ports as `UNSAFE`.
If the network already exists with a different host binding, fix the Docker
network manually before starting the stack; the wrapper will not remove it.
On Windows, also run `scripts/apply-echotes-supabase-firewall.ps1` from an
Administrator PowerShell to block inbound LAN access to `55420..55429` while
preserving localhost access.

The local database is rebuilt from versioned files in `supabase/migrations/`.
Current local migrations are:

- `001_auth_day_surface.sql`
- `002_note_echo_owner_default.sql`
- `003_harden_note_echo_surface.sql`
- `004_note_echo_flows.sql`
- `005_supabase_advisor_hardening.sql`

## Apply Supabase Migrations Remotely

1. authenticate locally with the Supabase CLI
2. link the project with `corepack pnpm exec supabase link --project-ref <ref>`
3. export the database password variable requested by the Supabase CLI in the
   current shell when remote Postgres access is required
4. inspect pending remote changes with `corepack pnpm run db:remote:dry-run`
5. apply with `corepack pnpm run db:remote:push` only when the dry run is
   expected

If a migration will be applied manually in the Supabase web console, use the
exact SQL from `supabase/migrations/`, then record that version in Supabase CLI
history with `corepack pnpm exec supabase migration repair <version> --status applied`.
Afterward, verify with `corepack pnpm run db:migrations` and run
`corepack pnpm run db:remote:dry-run`; the dry run should not propose the
manually applied migration again.

## Validate the Repository Before Merge

1. `corepack pnpm run doc:guard`
2. `corepack pnpm run lint`
3. `corepack pnpm run test`
4. `corepack pnpm run typecheck`

## Update the Canon After a Closed Feature

1. treat the closed feature package as implementation record
2. compare the root canon with the relevant sections in `docs/`
3. update `CANON-MIGRATION-COVERAGE.md` with `absorvida`, `parcialmente absorvida`
   or `ausente`
4. update the root canon with the absorbed behavior and detail
5. update `CHANGELOG.md`
6. register temporary mismatch in `DRIFT-LOG.md` if needed
7. re-run `corepack pnpm run doc:guard`

## Promote a Partially Absorbed Canon Section

1. read the original section in `docs/`
2. identify the destination root canon
3. move the rule, behavior, schema or test expectation into the destination
4. update `CANON-MIGRATION-COVERAGE.md` from `parcialmente absorvida` to
   `absorvida`
5. keep baseline status honest in `CURRENT-STATE.md`
6. run `corepack pnpm run doc:guard`

## Recover from Missing Supabase Setup

If the app reports invalid environment configuration:

1. verify `.env` exists
2. verify the two public Supabase variables are filled
3. re-open the shell so the environment is reloaded if needed
4. confirm migrations with `corepack pnpm run db:migrations`

## Recover from Supabase Local Autostart or Port Conflicts

If Docker Desktop starts Echotes containers without an explicit command:

1. run `corepack pnpm run supabase:doctor`
2. confirm each Echotes Supabase container reports `restart=no`
3. confirm published ports show `127.0.0.1:<port>` and not `0.0.0.0:<port>`
4. run `corepack pnpm run supabase:stop`
5. reopen Docker Desktop and confirm the Echotes stack stays stopped

If Supabase fails to bind a local port, keep the dedicated range in
`supabase/config.toml`: `55420..55429`. Do not move the Echotes stack back to
the default `54320..54329` range unless the Windows/Docker port reservation has
been verified clear.

## Build Android Dev Client (Local — sem EAS)

### Pré-requisitos

- JDK 17 instalado (Microsoft OpenJDK 17 confirmado nesta máquina)
- Android SDK em `C:\Users\smove\AppData\Local\Android\Sdk`
  (build-tools 34–36, platforms android-34–36)
- Windows Long Paths habilitado:
  ```powershell
  # PowerShell como Administrador — já executado
  reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f
  ```
  Requer reinicialização do Windows para ter efeito.

### Estado atual do repo (branch `004-dual-timeline-nav`)

- `expo-dev-client@6.0.21` instalado
- `eas.json` criado com perfil `development` (APK, internal)
- `android/` gerado via `expo prebuild --platform android --clean`
- `android/local.properties` criado apontando para o SDK local

O build local falhou antes do long paths ser ativado por limite de caminho do
CMake/Ninja (250 chars max para object files). O path do pnpm store com hash
longo (`expo-modules-core@3.0.29_re_608eee6e418ac022011475ab34711ee7`) excedia
o limite. Long Paths resolve isso.

### Rodar o build após reiniciar

```powershell
cd E:\PROJETOS-SMCR\Echotes\android
./gradlew assembleDebug
```

APK gerado em:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Instalar no device

```powershell
adb install E:/PROJETOS-SMCR/Echotes/android/app/build/outputs/apk/debug/app-debug.apk
```

### Iniciar Metro e conectar

```powershell
corepack pnpm expo start --dev-client
```

Abrir o app **Echotes** no device (não o Expo Go). Ele se conecta ao Metro na
mesma rede Wi-Fi. Shake abre o developer menu.

### Se o build falhar mesmo com Long Paths

Alternativa sem cloud: mover o projeto para um caminho mais curto (ex: `E:\ec`)
e repetir o `expo prebuild --platform android --clean` + `gradlew assembleDebug`.

## Apply Windows Firewall Containment

1. open PowerShell as Administrator
2. run `.\scripts\apply-echotes-supabase-firewall.ps1`
3. verify the rule `Echotes Supabase local ports - block inbound LAN` is
   enabled for TCP `55420-55429`
4. confirm Studio and API still respond through `127.0.0.1`

This rule is intentionally independent from Docker. Docker Desktop may still
display published ports as `0.0.0.0`; the Windows Firewall rule is the host
containment layer for inbound LAN traffic.
