#!/bin/bash
source venv/bin/activate
npm exec -- gulp --cwd gulp build
cp -v release.zip ../altux-ansible/roles/altux_site/files/release.zip
