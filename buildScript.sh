#!/bin/bash

#if [ $# -ne 1 ]; then
#  echo "param error"
#  exit 1
#fi

IMG_VER=$(grep 'APP_VERSION' .build_env | cut -d '=' -f 2)

DOCKER_REPOGITORY="autopoz.com:5001"
GROUP_ID="devops"

PROJECT_NAME="react-k8s-app"
MODULE_NM="realtime-logview"

echo "docker build -f ./Deploy/Dockerfile -t ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM} ."
docker build -f ./Deploy/Dockerfile -t ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM} .

echo ""

echo "docker build -f ./Deploy/Dockerfile -t ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:${IMG_VER} ."
docker build -f ./Deploy/Dockerfile -t ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:${IMG_VER} .

echo ""

echo "docker push ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:${IMG_VER}"
docker push ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:${IMG_VER}

echo ""

echo "docker tag ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:${IMG_VER} ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:latest"
docker tag ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:${IMG_VER} ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:latest

echo ""

echo "docker push ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:latest"
docker push ${DOCKER_REPOGITORY}/${GROUP_ID}/${PROJECT_NAME}.${MODULE_NM}:latest
