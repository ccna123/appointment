#!bin/bash

#go to app working directory
cd /home/ec2-user/appointment
chmod 700 -R appointment/

#add npm and node to path so that we can execute npm from working directory
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

#install npm and pm2
npm install -g pm2 -y

cd backend/
npm install
pm2 start index.js
