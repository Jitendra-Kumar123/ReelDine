const ImageKit = require('imagekit');

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "your_public_key",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "your_private_key",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/your_imagekit_id"
});

async function uploadFile(fileBuffer, fileName) {
    try {
        const result = await imagekit.upload({
            file: fileBuffer,
            fileName: fileName,
            folder: '/reelDine/videos/'
        });

        return {
            url: result.url,
            fileId: result.fileId,
            thumbnail: result.thumbnail
        };
    } catch (error) {
        console.error('ImageKit upload error:', error);
        throw new Error('Failed to upload file');
    }
}

async function deleteFile(fileId) {
    try {
        await imagekit.deleteFile(fileId);
        return { success: true };
    } catch (error) {
        console.error('ImageKit delete error:', error);
        throw new Error('Failed to delete file');
    }
}

module.exports = {
    uploadFile,
    deleteFile
};
