#!/bin/bash
# 更新版本号：V1.0.X，X 为 git 提交次数
COMMIT_COUNT=$(git rev-list --count HEAD)
echo "const VERSION = '1.0.${COMMIT_COUNT}';" > js/version.js
echo "Version updated to 1.0.${COMMIT_COUNT}"
