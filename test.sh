#!/usr/bin/env bash

function paramErr {
	echo 'use: ' $0 '--host [HOST] --port [PORT]  --project [PROJECT] --auth [USER:PASSWORD]';
	exit 1;
}

#######################################
#	check number parameter
#######################################
if [ $# -lt 8 ]; then
	paramErr;
fi;

#######################################
#	set host parameter
#######################################

if [ $1 == '--host' ]; then
	host=$2;
else 
	paramErr;
fi;

#######################################
#	set port parameter
#######################################

if [ $3 == '--port' ]; then
	port=$4;
else 
	paramErr;
fi;

#######################################
#	set auth parameter
#######################################

if [ $5 == '--auth' ]; then
	auth=$6;
else 
	paramErr;
fi;

#######################################
#	set project parameter
#######################################

if [ $7 == '--project' ]; then
	project=$8;
else 
	paramErr;
fi;

if [ $# -eq 9 ]; then
	testing=$9;
else
	testing='test';
fi;




env host=$host port=$port auth=$auth project=$project mocha --reporter spec --require should --ui bdd $testing
