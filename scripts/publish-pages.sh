#!/bin/bash
set -euv
cd gh-pages
git init
git remote add pb git@github.com:makeflow/draft-js-fluent-markdown-plugin.git || true
git add .
git commit -m "publish gh-pages"
git push pb master:gh-pages -f
