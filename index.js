const fs = require('fs');
const PapaParse = require('papaparse');
const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCRIIew-eQp2QjI5mRLFOE-qoUnl-qKC38'
});

// Get the geocoded address using existing address and other parameters like zipcode, city, state
async function getAddress(address, supportingAddressParameter, count) {
    let parameter = supportingAddressParameter[count];
    let addressQuery = address + ',' + parameter;
    let formattedAddress = await geocodeAddress(addressQuery);
    if (formattedAddress.length < 1) {
        count = count + 1;
        getAddress(address, supportingAddressParameter, count);
        return;
    }

    return formattedAddress;
}

// Function to geocode an address
function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        googleMapsClient.geocode({
            address: address
        }, (err, response) => {
            if (!err) {
                resolve(response.json.results);
            } else {
                reject(err);
            }
        });
    });
}

// Function to geocode addresses and create the csv file with the updated data
function geocodeAddressesAndSaveToCsv(data) {
    const promises = data.map(async (item) => {
        const address = `${item["AddressLine1"]}, ${item["ZipCode"]}`;

        // Geocode the address
        // const response = await geocodeAddress(address);
        let zipCode = String(item['ZipCode']);
        if (zipCode.length < 5) {
            zipCode = '0' + zipCode;
        }
        const addressParameter = [zipCode, item['City'], item['State']];
        const response = await getAddress(item['AddressLine1'], addressParameter, 0);

        if (response && response[0]) {
            // Update latitude and longitude in the original data
            item["Latitude"] = response[0].geometry.location.lat;
            item["Longitude"] = response[0].geometry.location.lng;
            // item["AddressLine1"] = response[0].formatted_address.replace(/, USA$/, '');
            item["AddressLine1"] = response[0].formatted_address;
        }

        return item;
    });

    // Wait for all promises to complete
    Promise.all(promises)
        .then((updatedData) => {
            // Save the updated data to a CSV file
            writeCSVFile(outputFilePath, updatedData);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

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
        console.log('File written successfully:', modifiedData);
    } catch (error) {
        console.error('Error writing CSV file:', error.message);
        throw error;
    }
}

// Process the data to write
async function processData() {
    try {
        const parsedData = await readCSVFile(inputFilePath);

        // Geocode address and save into csv
        geocodeAddressesAndSaveToCsv(parsedData);
    } catch (error) {
        console.error('Error processing data:', error.message);
    }
}

const inputFilePath = "assets/person-addresses.csv";
const outputFilePath = "assets/sample-csv-modified.csv";
// Invoke the async function
processData();