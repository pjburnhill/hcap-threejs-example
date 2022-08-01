const fs = require('fs-extra');

// Captures needs to be copied to dist for Parcel to serve the files.
(async () => {
  fs.mkdirs('./dist/captures', () => {
    fs.copy('./captures', './dist/captures');
  });
})();
