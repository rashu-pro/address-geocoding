const fs = require('fs');
const PapaParse = require('papaparse');
const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCRIIew-eQp2QjI5mRLFOE-qoUnl-qKC38'
});

const inputFilePath = "assets/sample-csv-file.csv";
const outputFilePath = "assets/sample-csv-modified.csv";

// Read a csv file
async function readCSVFile(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return new Promise((resolve, reject) => {
            PapaParse.parse(data, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    } catch (error) {
        console.error('Error reading or parsing CSV file:', error.message);
        throw error;
    }
}

// Write data as csv file
async function writeCSVFile(outputFilePath, modifiedData) {
    try {
        const csvString = PapaParse.unparse(modifiedData, { header: true });
        await fs.promises.writeFile(outputFilePath, csvString, 'utf8');
        console.log('File written successfully:', outputFilePath);
    } catch (error) {
        console.error('Error writing CSV file:', error.message);
        throw error;
    }
}

// Process the data to write
async function processData() {
    try {
        const parsedData = await readCSVFile(inputFilePath);

        // Modify the parsed data (replace this with your own logic)
        const modifiedData = modifyData(parsedData);

        await writeCSVFile(outputFilePath, modifiedData);
    } catch (error) {
        console.error('Error processing data:', error.message);
    }
}

// Modify the data
function modifyData(data) {
    // Your modification logic here
    return data;
}

// Invoke the async function
processData();