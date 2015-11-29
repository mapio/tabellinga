#!/bin/bash

hg ci -mPublish
hg push
surge .
