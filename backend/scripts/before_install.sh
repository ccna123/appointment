#!bin/bash

#download node and npm
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install node

#create working directory if it does not exist
DIR="/home/ec2-user/appointment"
if [ -s "$DIR" ]; then
    echo "${DIR} exist"
else
    echo "Creating ${DIR} directory"
    mkdir ${DIR}
fi
