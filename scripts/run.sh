#!/bin/bash

# node, npm, yarn 명령어 사용을 위한 설정 (.bashrc 파일에 추가되어 있는 내용)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# PM2로 실행 중인 서버 중지 및 삭제
pm2 delete hunsu-project

# 서버를 PM2로 실행
NODE_ENV=production && pm2 --name hunsu-project  start dist/main.js

# PM2 설정 저장 (선택사항, startup 설정을 해놨다면)
pm2 save