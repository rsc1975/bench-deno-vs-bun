# Tested in Ubuntu

sudo apt -y install git curl unzip

curl -fsSL https://deno.land/x/install/install.sh | sh

curl https://bun.sh/install | bash

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs


git clone https://github.com/rsc1975/bench-deno-vs-bun.git
cd bench-deno-vs-bun
bun install

npm run start
npm run show

