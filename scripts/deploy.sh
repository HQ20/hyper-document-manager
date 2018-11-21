#!/bin/bash

dist_dir="./dist"
peer_admin_card="PeerAdmin@hlfv1"
project_name="document-manager"
project_version="0.0.0"


if [ ! -f /tmp/hplf_proj_version.txt ]; then
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
else
    # increase version
    project_version=$(cat /tmp/hplf_proj_version.txt)
    minor_version=$(echo $project_version | grep -o '[0-9]\+$')
    majors_version=$(echo $project_version | grep -o  '^[0-9]\+.[0-9]\+.')
    increased=$(($minor_version + 1))
    project_version="$majors_version$increased"
fi
echo $project_version > /tmp/hplf_proj_version.txt

# remove any existing file
for entry in "$dist_dir"/*.bna
do
    rm "$entry" 2> /dev/null
done

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

#check if in use
ping_result=$(composer network ping --card admin@$project_name)
already_in_use="Business network version: $project_version"

while IFS= read -r line ; do
    if [[ $line =~ $already_in_use ]];
    then
        echo "This version is already in use!"
        exit 1
    fi
done <<< "$ping_result"

# generate
composer archive create -t dir -n . --archiveFile $project_name@$project_version.bna
composer network install --card $peer_admin_card --archiveFile $project_name@$project_version.bna

#deploy
if [[ $ping_result == *successfully* ]];
then
    composer network upgrade -c $peer_admin_card -n $project_name -V $project_version
else
    composer network start --networkName $project_name --networkVersion $project_version --networkAdmin admin --networkAdminEnrollSecret adminpw --card $peer_admin_card --file networkadmin.card
fi

mv $project_name@$project_version.bna $dist_dir

echo "Success!"