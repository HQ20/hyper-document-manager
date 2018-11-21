#!/bin/bash

peer_admin_card="PeerAdmin@hlfv1"
project_name="hyper-document-manager"
project_version="0.0.0"
fabric_dev_servers="$HOME/fabric-dev-servers"


 # extract project version
python_version=$(python -V)
if [[ $node_version != *2* ]]
then
    export PYTHONIOENCODING=utf8
    project_version=$(cat package.json | \
        python -c "import sys, json; print json.load(sys.stdin)['version']")
else
    project_version=$(cat package.json | \
        python3 -c "import sys, json; print(json.load(sys.stdin)['version'])")
fi

# set node version to version 8 if not set
node_version=$(node -v)
if [[ $node_version != *8* ]]
then
    echo "setting node to version 8"
    . ~/.nvm/nvm.sh
    . ~/.profile
    . ~/.bashrc
    echo $(nvm use 8.12.0)
fi

$fabric_dev_servers/startFabric.sh

composer archive create -t dir -n . --archiveFile $project_name.bna
composer network install --card $peer_admin_card --archiveFile $project_name.bna
composer network start --networkName $project_name --networkVersion $project_version --networkAdmin admin --networkAdminEnrollSecret adminpw --card $peer_admin_card --file networkadmin.card

card_exists=$(composer network ping --card admin@$project_name)
if [[ $card_exists == *successfully* ]]
then
    composer card delete --card admin@$project_name
fi
composer card import --file networkadmin.card