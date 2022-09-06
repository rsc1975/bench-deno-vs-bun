echo Bun test load init

QUIET=true PORT=3003 bun run h3lp3r-bun/src/index.ts &
sleep 1

URL_BASE="http://localhost:3003" PLATFORM="bun" VERSION="$(bun --version)" deno run -A --unstable run_test.ts

killall bun

echo Bun test load end
