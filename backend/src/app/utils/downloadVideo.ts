import axios from 'axios';
import fs from 'fs';

/**
 * Download a file from Google Drive and save it to the local path.
 * @param fileId Google Drive file ID
 * @param filePath Local file path where the video will be saved
 * @returns Promise resolving when download is complete
 */
const downloadFileFromGoogleDrive = async (
  fileId: string,
  filePath: string,
): Promise<void> => {
  const url = `https://drive.google.com/uc?id=${fileId}&export=download`;

  const writer = fs.createWriteStream(filePath);

  // Download file as stream from Google Drive
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream', // important to handle file as a stream
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

export default { downloadFileFromGoogleDrive };
