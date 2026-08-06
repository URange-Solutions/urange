import ImageKit from "imagekit";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const url = process.env.IMAGEKIT_URL;

if (!publicKey) {
    throw new Error("Missing IMAGEKIT_PUBLIC_KEY= environment variable.")
}

if (!privateKey) {
    throw new Error("Missing IMAGEKIT_PRIVATE_KEY= environment variable.")
}

if (!url) {
    throw new Error("Missing IMAGEKIT_URL= environment variable.")
}

export const imagekit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint: url
});