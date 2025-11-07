#!/bin/sh

# The MIT License (MIT)
#
# Copyright (c) 2015 Eficode Oy
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

VERSION="2.2.4"

set -- "$@" -- "$TIMEOUT" "$QUIET" "$PROTOCOL" "$HOST" "$PORT" "$result"
TIMEOUT=15
QUIET=0
PROTOCOL="tcp"
HOST=""
PORT=""
while [ $# -gt 0 ]
do
  case "$1" in
    *:* )
    HOST=$(printf "%s\n" "$1"| cut -d : -f 1)
    PORT=$(printf "%s\n" "$1"| cut -d : -f 2)
    shift 1
    ;;
    -q | --quiet)
    QUIET=1
    shift 1
    ;;
    -q-*)
    QUIET=1
    PROTOCOL=$(printf "%s\n" "$1" | cut -c 3-)
    shift 1
    ;;
    -q*)
    QUIET=1
    PROTOCOL=$(printf "%s\n" "$1" | cut -c 3-)
    shift 1
    ;;
    -t | --timeout)
    TIMEOUT="$2"
    if [ "$TIMEOUT" = "" ]; then
      break
    fi
    shift 2
    ;;
    -t*)
    TIMEOUT=$(printf "%s\n" "$1" | cut -c 3-)
    shift 1
    ;;
    --timeout=*)
    TIMEOUT=$(printf "%s\n" "$1" | cut -d = -f 2)
    shift 1
    ;;
    --)
    shift
    break
    ;;
    --help)
    usage
    ;;
    -*)
    echoerr "Unknown option: $1"
    usage
    ;;
    *)
    HOST="$1"
    PORT="$2"
    shift 2
    ;;
  esac
done

if [ "$HOST" = "" -o "$PORT" = "" ]; then
  echoerr "Error: you need to provide a host and port to test."
  usage
fi

TIMEOUT=${TIMEOUT:-15}
QUIET=${QUIET:-0}

if [ "$PROTOCOL" = "tcp" ]; then
  error_prefix="Connection to $HOST $PORT timed out"
else
  error_prefix="Error connecting to $HOST $PORT"
fi

wait_for() {
  if [ "$QUIET" -ne 1 ]; then
    echo "Waiting for $HOST:$PORT to be ready..."
  fi

  start_ts=$(date +%s)
  while :
  do
    if [ "$PROTOCOL" = "tcp" ]; then
      (echo > /dev/tcp/$HOST/$PORT) >/dev/null 2>&1
    else
      curl --output /dev/null --silent --fail $HOST:$PORT
    fi

    result=$?
    if [ $result -eq 0 ]; then
      end_ts=$(date +%s)
      if [ "$QUIET" -ne 1 ]; then
        echo "Connected to $HOST:$PORT after $((end_ts - start_ts)) seconds"
      fi
      exit 0
    fi

    sleep 1
    now_ts=$(date +%s)
    if [ $((now_ts - start_ts)) -ge "$TIMEOUT" ]; then
      echoerr "$error_prefix"
      exit 1
    fi
  done
}

wait_for