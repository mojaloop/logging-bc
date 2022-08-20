#!/bin/bash
set -x

# The root directory of packages to publish
ROOT="./modules"
REPOSITORY_TYPE="github"
CIRCLE_API="https://circleci.com/api"

if [[ -z "${CIRCLE_TOKEN}" ]]; then
    echo -e "\e[93mEnvironment variable CIRCLE_TOKEN is not set. Exiting.\e[0m"
  exit 1
fi

if [[ -z "${CIRCLE_SHA1}" ]]; then
    echo -e "\e[93mEnvironment variable CIRCLE_SHA1 is not set. Exiting.\e[0m"
  exit 1
fi

############################################
## 2. Changed packages
############################################
PACKAGES=$(ls ${ROOT} -l | grep ^d | awk '{print $9}')
echo "Searching for changes ..."

## The CircleCI API parameters object
PARAMETERS='"trigger":false'
COUNT=0

for PACKAGE in ${PACKAGES[@]}
do
  PACKAGE_PATH=${ROOT}/$PACKAGE
  PACKAGE_LAST_CHANGE_COMMIT_SHA=$(git --no-pager log -1 --format=format:%H --full-diff $PACKAGE_PATH)
  PACKAGE_IS_PRIVATE=$(jq -e ".private == true" $PACKAGE_PATH/package.json)
  echo -e "Package: ${PACKAGE} last change commit sha is: ${PACKAGE_LAST_CHANGE_COMMIT_SHA} (Private: ${PACKAGE_IS_PRIVATE})"

  if [[ "$PACKAGE_IS_PRIVATE" == 'false' ]] && [[ -z "$PACKAGE_LAST_CHANGE_COMMIT_SHA" ]] || [[ "$CIRCLE_SHA1" == "$PACKAGE_LAST_CHANGE_COMMIT_SHA" ]]; then
        PARAMETERS+=", \"$PACKAGE\":true"
        COUNT=$((COUNT + 1))
        #echo -e "\e[36m  [+] ${PACKAGE} \e[21m (changed in [${LATEST_COMMIT_SINCE_LAST_BUILD:0:7}])\e[0m"
        echo -e "Package: ${PACKAGE} CHANGED!!"
  else
    echo -e "Package: ${PACKAGE} not changed or private"
  fi

done

if [[ $COUNT -eq 0 ]]; then
  echo -e "\e[93mNo changes detected in packages. Skip triggering workflows.\e[0m"
  exit 0
fi

echo "Changes detected in ${COUNT} package(s)."


############################################
## 3. CicleCI REST API call
############################################
#DATA="{ \"branch\": \"$CIRCLE_BRANCH\", \"parameters\": { $PARAMETERS } }"
DATA="{ \"branch\": \"$CIRCLE_BRANCH\", \"parameters\": {  \"trigger\":false, \"publish\":true } }"
echo "Triggering pipeline with data:"
echo -e "  $DATA"

URL="${CIRCLE_API}/v2/project/${REPOSITORY_TYPE}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/pipeline"
HTTP_RESPONSE=$(curl -s -u "${CIRCLE_TOKEN}:" -o response.txt -w "%{http_code}" -X POST --header "Content-Type: application/json" -d "$DATA" "$URL")

if [ "$HTTP_RESPONSE" -ge "200" ] && [ "$HTTP_RESPONSE" -lt "300" ]; then
    echo "API call succeeded."
    echo "Response:"
    cat response.txt
else
    echo -e "\e[93mReceived status code: ${HTTP_RESPONSE}\e[0m"
    echo "Response:"
    cat response.txt
    exit 1
fi
