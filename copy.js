//Dependancies
const fs = require("fs");
const path = require("path");

//Copy
function copy(source, target, targetDuplicates, callback) {
    //Record start time
    let startTime = Date.now();

    //Join the paths
    source = path.join(__dirname, source);
    target = path.join(__dirname, target);
    targetDulplicates = path.join(__dirname, targetDuplicates);

    //Show scanning message
    console.log("Scanning Existing Files");
    //Scan through the target duplicateFiles, finding existingFiles
    var existingFiles = [];
    function scanDir(dirPath, callback) {
        fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
            if (err) callback(err);
            else {
                //If there was an error
                var error = false;
                //Number of directories to scan
                var dirToScan = 0;
                //Number of directories scanned
                var dirsScanned = 0;
                //Loop through files
                files.forEach(file => {
                    if (file.isFile()) {
                        //File is file, so add file name
                        existingFiles.push(file.name);
                    }
                    else {
                        //File is folder, so scan folder
                        dirToScan++;
                        //Make a new path
                        let newPath = path.join(dirPath, file.name);
                        //Scan
                        scanDir(newPath, err => {
                            //This was scanned
                            dirsScanned++;
                            if (err) error = true;
                            //If this was the lastOne
                            if (dirsScanned == dirToScan) {
                                //Check if there was an error
                                if (err) callback(true);
                                else callback(false);
                            }
                        });
                    }
                });
                if (dirToScan == 0) {
                    //Nothing to scan
                    callback(false);
                }
            }
        });
    }
    scanDir(targetDuplicates, err => {
        if (err) callback(err);
        else {
            //Show scanning sources message
            console.log("Checking For Duplicate Files");

            //Read the source
            fs.readdir(source, { withFileTypes: true }, (err, files) => {
                //Check the files
                var duplicateCount = 0;
                var newFileCount = 0;
                var duplicateFiles = [];
                var newFiles = [];
                //Loop throught the files
                files.forEach(file => {
                    //Check if duplicate
                    if (existingFiles.includes(file.name)) {
                        duplicateCount++;
                        duplicateFiles.push(file.name);
                    }
                    else {
                        newFileCount++;
                        newFiles.push(file.name);
                    }
                });

                //Show Files
                console.log(duplicateCount + " Duplicate Files");
                console.log(newFileCount + " New Files");

                //Show Copying
                console.log("Copying New Files");

                //Function for done copying
                function done(err) {
                    let totalTime = Math.ceil((Date.now() - startTime) / 1000);
                    if (err) console.log("Error Copying Files");
                    else console.log("Successfuly Copied Files In " + totalTime + " Second" + (totalTime != 1 ? "s" : ""));
                    callback(err);
                };

                //Number of files copied
                var filesCopied = 0;
                //If there was an error
                var error = false;

                //Loop through all files copying files
                newFiles.forEach(file => {
                    //Get the path of the file
                    let filePath = path.join(source, file);
                    let destinationPath = path.join(target, file);
                    //Copy file
                    fs.copyFile(filePath, destinationPath, err => {
                        filesCopied++;
                        if (err) error = true;
                        //If this was the last one
                        if (filesCopied == newFileCount) {
                            done(error);
                        };
                    });
                });
                if (newFileCount == 0) {
                    //Done
                    done(false);
                }
            });
        }
    });
};

//Export the function
module.exports = copy;