#!/bin/bash
set -x

############################################
## 2. Setup
############################################

# The root directory of packages to publish
ROOT="./modules"
REPOSITORY_TYPE="github"
CIRCLE_API="https://circleci.com/api"

if [[ -z "${CIRCLE_SHA1}" ]]; then
    echo -e "\e[93mEnvironment variable CIRCLE_SHA1 is not set. Exiting.\e[0m"
  exit 1
fi

############################################
## 2. Changed packages
############################################
PACKAGES=$(ls ${ROOT} -l | grep ^d | awk '{print $9}')
echo "Searching for changes ..."

PUBLISH_PACKAGES=""
COUNT=0

for PACKAGE in ${PACKAGES[@]}
do
  PACKAGE_PATH=${ROOT}/$PACKAGE
  PACKAGE_LAST_CHANGE_COMMIT_SHA=$(git --no-pager log -1 --format=format:%H --full-diff $PACKAGE_PATH)

  # jq not always installed
  # PACKAGE_IS_PRIVATE=$(jq -e ".private == true" $PACKAGE_PATH/package.json)

  PACKAGE_IS_PRIVATE=$(cat $PACKAGE_PATH/package.json | grep private | head -1 | awk -F: '{ print $2 }' | sed 's/[ ",]//g')
  if [[ -z "$PACKAGE_IS_PRIVATE" ]]; then
    PACKAGE_IS_PRIVATE=false
  fi

  echo -e "Package: ${PACKAGE} last change commit sha is: ${PACKAGE_LAST_CHANGE_COMMIT_SHA} (Private: ${PACKAGE_IS_PRIVATE})"

  if [[ -z "$PACKAGE_IS_PRIVATE" || "$PACKAGE_IS_PRIVATE" == 'false' ]] && [[ -z "$PACKAGE_LAST_CHANGE_COMMIT_SHA" ]] || [[ "$CIRCLE_SHA1" == "$PACKAGE_LAST_CHANGE_COMMIT_SHA" ]]; then
        PARAMETERS+=", \"$PACKAGE\":true"
        PUBLISH_PACKAGES+"$PACKAGE "
        COUNT=$((COUNT + 1))
        #echo -e "\e[36m  [+] ${PACKAGE} \e[21m (changed in [${LATEST_COMMIT_SINCE_LAST_BUILD:0:7}])\e[0m"
        echo -e "Package: ${PACKAGE} CHANGED!! Publishing starting..."

        # jq not always installed
        #PACKAGE_NAME=$(jq '.name' ${PACKAGE_PATH}/package.json | sed -r 's/^"|"$//g')
        PACKAGE_NAME=$(cat ${PACKAGE_PATH}/package.json | grep name | head -1 | awk -F: '{ print $2 }' | sed 's/[ ",]//g')

        echo $PACKAGE_NAME

        npm -w $PACKAGE_NAME run publish

        if [[ $? -eq 0 ]]; then
          echo -e "Package: ${PACKAGE} Publishing complete"
        else
          echo -e "Package: ${PACKAGE} Publishing error... exiting"
          exit 1
        fi

  else
    echo -e "Package: ${PACKAGE} not changed or private"
  fi
done

if [[ $COUNT -eq 0 ]]; then
  echo -e "\e[93mNo changes detected in packages. Skip triggering workflows.\e[0m"
  exit 0
fi

echo "Changes detected in ${COUNT} package(s): ${PUBLISH_PACKAGES}"
exit 0

