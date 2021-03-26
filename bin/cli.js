#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

/* eslint-disable-next-line no-unused-expressions */
yargs(hideBin(process.argv))
  .commandDir('cli')
  .demandCommand()
  .help('help')
  .wrap(null)
  .argv;
