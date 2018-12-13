#!/bin/sh

set -e

PROJECT_NAME=${PWD##*/}

if [ "$2" != "" ]; then
  MOSS_ASSETS_PATH="$2"
elif [ "$MOSS_ASSETS_PATH" != "" ]; then
  MOSS_ASSETS_PATH=$MOSS_ASSETS_PATH
else
  MOSS_ASSETS_PATH=/usr/local/lib/moss/assets
fi

case $1 in
build)
  if [ ! -d ./content ]; then
    echo "There must be a content directory at the current path"
    exit 1
  fi

  rm -rf ./assets

  mkdir assets

  cp $MOSS_ASSETS_PATH/moss.js ./assets/moss.js
  cp $MOSS_ASSETS_PATH/moss.css ./assets/moss.css

  sorted_files() {
    # sort filenames by depth then path
    find -L content -name '*.txt' \
      | awk -F/ '{printf("%04d %s\n", NF, $0)}' \
      | sort \
      | cut -d ' ' -f 2
  }

  for file in $(sorted_files); do
    cat "$file"
    echo
    echo
  done > assets/data.txt

  cat << EOF > assets/index.html
  <html>
  <head>
  <meta charset="utf-8">
  <script src="moss.js"></script>
  <link rel="stylesheet" type="text/css" href="moss.css">
  <link rel="icon" href="data:;base64,iVBORw0KGgo=">
  </head>
  <body>
  <div id="_moss" data-source_url="data.txt">
  </div>
  </body>
  </html>
EOF

  cat << EOF > $PROJECT_NAME.html
  <html>
  <head>
  <meta charset="utf-8">
  <script>
  </script>
  <style>
  </style>
  </head>
  <body>
  <div id="_moss" data-debug="true">
  <pre>
  </pre>
  </div>
  </body>
  </html>
EOF

  sed -i.bak '/<script>/r assets/moss.js' $PROJECT_NAME.html
  sed -i.bak '/<style>/r assets/moss.css' $PROJECT_NAME.html
  sed -i.bak '/<pre>/r assets/data.txt' $PROJECT_NAME.html
  rm *.bak;;

update)
  cd /usr/local/lib/moss
  git pull origin master
  make
  cp script/moss /usr/local/bin/moss
  echo Update success;;

init)
  mkdir content
  touch .gitignore
  echo "assets" >> .gitignore
  echo "*.html" >> .gitignore
  echo "*.pid" >> .gitignore
  echo "*.csv" >> .gitignore
  git init
  touch "content/$PROJECT_NAME.txt"
  git add .
  git commit -m "Initial commit"
  moss watch;;
watch)
  command -v fswatch >/dev/null 2>&1 || { echo >&2 "Moss watch requires fswatch to be installed. Aborting."; exit;}

  PIDFILE=.moss_watch.pid
  if [ -f $PIDFILE ];
  then
    PID=$(cat $PIDFILE)
    if ps -p $PID > /dev/null 2>&1;
    then
      # Moss watch is already running
      kill $PID
    fi
  fi

  if [ ! -d ./content ]; then
    echo "There must be a content directory at the current path"
    exit 1
  fi

  #######
  fswatch -0 -o content | xargs -0 -n1 -I{} nohup moss build $2 > /dev/null 2>&1 &
  #######

  echo $(jobs -p | tail -1) > $PIDFILE
  if [ $? -ne 0 ];
  then
    echo "Could not create PID file"
    exit 1
  fi

  moss build $2;;
unwatch)
  kill $(cat .moss_watch.pid) > /dev/null 2>&1;
  exit 1;;
build_csvs)
  find -L content -name '*.txt' | xargs /usr/local/lib/moss/script/moss_text_to_csv
  ;;
update_txt_from_csvs)
  find -L content -name '*.csv' | xargs /usr/local/lib/moss/script/csv_to_moss_text
  ;;
watch_csvs)
  fswatch -r content | grep --line-buffered .txt$ | while read file; do /usr/local/lib/moss/script/moss_text_to_csv $file; done &
  fswatch -r content | grep --line-buffered .csv$ | while read file; do /usr/local/lib/moss/script/csv_to_moss_text $file; done &
  echo "Watching txt and csv files"
  ;;
?|usage)
echo  "Usage:"
echo  "  moss build [<asset-path>]"
echo  "  moss update"
echo  "  moss init"
echo  "  moss watch [<asset-path>]"
echo  "  moss unwatch"
echo  "  moss build_csvs"
echo  "  moss update_text_from_csvs"
echo  "  moss watch_and_convert_csvs";;
*)
  echo unknown command;;
esac

