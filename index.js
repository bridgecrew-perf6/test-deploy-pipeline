//Node built in modules
const fs = require("fs");
const path = require("path");

// Utils
const express = require("express");
const cors = require('cors');
const formidable = require('formidable');
const extractZip = require('extract-zip');
const FtpDeploy = require('ftp-deploy');

// Environment variables
require('dotenv').config();

// Output
const uploadDir = path.join(__dirname, '/uploads/');
const extractDir = path.join(__dirname, '/app/');

// Configure server
const serverPort = 9999;
const app = express();

app.use(cors());

app.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort}\n`);
});

app.post('/upload-project', (data) => {
    console.log('Message received', data);
});

// Configure deploy
const ftpDeploy = new FtpDeploy();

// Upload file
function uploadFile(req, res) {
    const form = new formidable.IncomingForm();
    // file size limit 100MB. change according to your needs
    form.maxFileSize = 100 * 1024 * 1024;
    form.keepExtensions = true;
    form.multiples = false;
    form.uploadDir = uploadDir;

    form.parse(req, (err, fields, files) => {
        if (!files.project) return console.error('No files found');
        const file = files.project;

        const extension = path.extname(file.originalFilename);

        const fileInfos = {
            fileExtention: extension,
            fileName: path.basename(file.originalFilename, extension),
            newFilename: file.newFilename,
            path: file.filepath,
            mimetype: file.mimetype,
            size: file.size,
        }

        const destDir = `${path.join(extractDir, fileInfos.fileName)}_${new Date().getTime()}`;

        extractZip(fileInfos.path, { dir: destDir }).then((res) => {
            console.log('EXTRACTING...');
            deploy(destDir, fileInfos);
        });

        res.sendStatus(200);
    });

    function deploy(path, fileInfos) {
        const config = {
            user: process.env.FTP_USER,
            // Password optional, prompted if none given
            password: process.env.FTP_PASSWORD,
            host: process.env.FTP_HOST,
            port: 21,
            localRoot: path,
            remoteRoot: '/',
            include: ["*", "**/*"],
            deleteRemote: false,
            sftp: false,
        }

        ftpDeploy.deploy(config).then(() => {
            console.log('COMPLETED');
        });

        ftpDeploy.on("uploaded", function (data) {
            console.log('UPLOADING...', data); // same data as uploading event
        });
    }
}