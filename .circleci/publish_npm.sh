#!/bin/bash
#set -x

function printHeader() {
  echo -e "\n****************************************"
  echo -e "${1}"
  echo -e "****************************************"
}

############################################
## 1. Setup
############################################
printHeader "Phase 1 - Setup"

# The root directory of packages to publish
ROOT="./modules"
REPOSITORY_TYPE="github"
CIRCLE_API="https://circleci.com/api"


if [[ -z "${CIRCLE_SHA1}" ]]; then
    echo -e "\e[93mEnvironment variable CIRCLE_SHA1 is not set. Exiting.\e[0m"
  exit 1
fi

echo -e "Current CI Build commit hash: ${CIRCLE_SHA1}"

LAST_CI_BUILD_COMMIT=$(curl -Ss -u "$CIRCLE_TOKEN:" "https://circleci.com/api/v1.1/project/github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME?filter=completed&limit=1" | grep "vcs_revision" | head -1 | awk -F: '{print $2}' | sed 's/[ ",]//g')
echo -e "Last successful CI Build commit hash: ${LAST_CI_BUILD_COMMIT}"

COMMITS_SINCE_LAST_CI_BUILD=$(git --no-pager log ${LAST_CI_BUILD_COMMIT}..${CIRCLE_SHA1} --pretty=format:%H)
echo -e "\nCommits between last successful CI Build and this one:\n${COMMITS_SINCE_LAST_CI_BUILD}"

############################################
## 2. Detecting changed packages
############################################
printHeader "Phase 2 - Detecting changed packages since last CI build"

PACKAGES=$(ls -l ${ROOT} | grep ^d | awk '{print $9}')
echo -e "Found these packages:\n${PACKAGES}"

PACKAGES_TO_PUBLISH=""
PACKAGES_TO_PUBLISH_COUNT=0

for PACKAGE in ${PACKAGES[@]}
do
  echo -e "\nChecking package: ${PACKAGE}..."
  PACKAGE_PATH=${ROOT}/$PACKAGE
  PACKAGE_LAST_CHANGE_COMMIT_SHA=$(git --no-pager log -1 --format=format:%H --full-diff $PACKAGE_PATH)
  PACKAGE_IS_PRIVATE=$(cat $PACKAGE_PATH/package.json | grep private | head -1 | awk -F: '{ print $2 }' | sed 's/[ ",]//g')

  if [[ -z "$PACKAGE_IS_PRIVATE" ]]; then
    PACKAGE_IS_PRIVATE=false
  fi

  echo -e "\tPackage last change commit: ${PACKAGE_LAST_CHANGE_COMMIT_SHA} - Private: ${PACKAGE_IS_PRIVATE}"

  if [[ "$PACKAGE_IS_PRIVATE" == 'false' ]] && [[ -z "$PACKAGE_LAST_CHANGE_COMMIT_SHA" ]] || [[ $COMMITS_SINCE_LAST_CI_BUILD == *"$PACKAGE_LAST_CHANGE_COMMIT_SHA"* ]]; then
        PACKAGES_TO_PUBLISH+="$PACKAGE "
        PACKAGES_TO_PUBLISH_COUNT=$((PACKAGES_TO_PUBLISH_COUNT + 1))
        echo -e "\tPackage changed since last CI build - adding to the list"
  else
    if [[ "$PACKAGE_IS_PRIVATE" == 'true' ]]; then
      echo -e "\tPackage is private - ignoring"
    else
      echo -e "\tPackage not changed since last CI build - ignoring"
    fi
  fi
done


if [[ PACKAGES_TO_PUBLISH_COUNT -le 0 ]]; then
  echo -e "\nDidn't find any packages that needed publishing, done"
  exit 0
fi

############################################
## Phase 3 - Publishing changed packages
############################################
printHeader "Phase 3 - Publishing changed packages"

PUBLISHED_PACKAGES_COUNT=0

echo -e "Going to publish ${PACKAGES_TO_PUBLISH_COUNT} package(s)..."

for PACKAGE in ${PACKAGES_TO_PUBLISH}
do
  echo -e "\n------------------------"
  echo -e "Publishing package: ${PACKAGE}..."

  PACKAGE_PATH=${ROOT}/$PACKAGE
  PACKAGE_NAME=$(cat ${PACKAGE_PATH}/package.json | grep name | head -1 | awk -F: '{ print $2 }' | sed 's/[ ",]//g' )
  PACKAGE_CUR_VERSION=$(cat ${PACKAGE_PATH}/package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[ ",]//g' )

  ## increase patch version only
  npm -w ${PACKAGE_NAME} version patch
  PACKAGE_NEW_VERSION=$(cat ${PACKAGE_PATH}/package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[ ",]//g')

  echo -e "Package full name: ${PACKAGE_NAME}"
  echo -e "Package current version: ${PACKAGE_CUR_VERSION} new version: ${PACKAGE_NEW_VERSION} (to be published)"
  echo -e "Publishing..."

  echo -e "---------------- PUBLISH START ----------------------"
  # actual publish command
  npm -w ${PACKAGE_NAME} publish --tag=latest --access public
  echo -e "----------------- PUBLISH END -----------------------"

  if [[ $? -eq 0 ]]; then
    PUBLISHED_PACKAGES_COUNT=$((PUBLISHED_PACKAGES_COUNT + 1))
    TAG_NAME=${PACKAGE}_v${PACKAGE_NEW_VERSION}
    echo -e "Successfully published - git staging '${PACKAGE_PATH}/package.json' and creating tag: '${TAG_NAME}'"
    git add ${PACKAGE_PATH}/package.json
    git tag ${TAG_NAME}
  else
    echo -e "Error publishing package: ${PACKAGE} - exiting"
    exit 1
  fi
done

############################################
## Phase 4 - Pushing commits to git
############################################
printHeader "Phase 4 - Pushing commits to git"

if [[ PUBLISHED_PACKAGES_COUNT -gt 0 ]]; then
  echo -e "${PUBLISHED_PACKAGES_COUNT} package(s) were published, committing changed 'package.json' files..."

# git status
  git commit -nm "$(git log -1 --pretty=%B) (circleci auto versions update) [ci skip]"

  echo -e "Pushing commits..."
#  git status
  git push -f origin $CIRCLE_BRANCH --tags

  echo -e "\nDONE - ${PUBLISHED_PACKAGES_COUNT} package(s) were published, all done."
else
  echo -e "${PUBLISHED_PACKAGES_COUNT} Packages were found to be published, but none was successfully published, error."
  exit 9
fi
