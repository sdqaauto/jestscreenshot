
const del = require('del');
const fs = require('fs');
const { addAttach } = require("jest-html-reporters/helper");

exports.promiseScreenshot = null;

let options = {
  page: null,
  dirName: null,
  scriptName: null,
  onlyFailures: false
};

exports.init = async (_options) => {
  /* global jasmine */
  
  options = _options;
  
  try { fs.mkdirSync(options.dirName+'/screenshots', { recursive: true }); } catch (error) {}
  // await del([options.dirName+'/screenshots/*.png']);  
  
  jasmine.getEnv().addReporter({
    specDone: async function(result) {
      if (exports.promiseScreenshot) {
        var p = exports.promiseScreenshot;
        
        exports.promiseScreenshot = null;
        
        Promise.all([p]).then(function() {
          exports.promiseScreenshot = screenshot(result);
          exports.promiseScreenshot.then(function() {
            exports.promiseScreenshot = null;
          });
        });
      }
      else {
        exports.promiseScreenshot = screenshot(result);
        exports.promiseScreenshot.then(function() {
          exports.promiseScreenshot = null;
        });
      }
    },
  });
};

exports.cleanup = function(funcCleanup) {
  if (exports.promiseScreenshot) {
    exports.promiseScreenshot.then(function() {
      funcCleanup();
    });  
  }
  else {
    funcCleanup();
  }
}

async function screenshot(result) {
  let specName = result.fullName.replace(/\s/g, '-');
  
  return new Promise(function(resolve, reject) {
    if (result.status === 'failed') {
      addAttach(options.dirName + '/screenshots/0-fail-' + options.scriptName + '-' + specName + '.png');
      options.page.screenshot({path: options.dirName + '/screenshots/0-fail-' + options.scriptName + '-' + specName + '.png'})
      .then(function() { resolve(); })
      .catch(function() { resolve(); });
    }
    else if (options.onlyFailures) {
      resolve();
    }
    else {
      addAttach(options.dirName + '/screenshots/' + options.scriptName + '-' + specName + '.png');
      options.page.screenshot({path: options.dirName + '/screenshots/' + options.scriptName + '-' + specName + '.png'})
      .then(function() { resolve(); })
      .catch(function() { resolve(); });
    }
  });
}

