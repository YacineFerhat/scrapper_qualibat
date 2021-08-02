const { Storage } = require("@google-cloud/storage");
const path = require('path')
const serviceKey = path.join(__dirname, './keys.json')

const saveImage = async (fileInput, name) => {
  const gcs = new Storage({
    projectId: "laflore-paris",
    keyFilename: serviceKey
  });
  const bucket = gcs.bucket("images-laflore-paris");
  const gcsFileName = name 
  const file = bucket.file(gcsFileName);
  const result = await file.save(fileInput.buffer, {
    gzip: true,
    resumable: false,
    validation: false,
    metadata: {
      cacheControl: "no-cache",
    },
  });
  const exist = await file.exists();
  const fileUrl =
    "https://storage.googleapis.com/images-laflore-paris/" + gcsFileName;
  return fileUrl;
};

exports.saveImage = saveImage;
