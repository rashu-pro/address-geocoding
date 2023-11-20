const fs = require('fs');
const PapaParse = require('papaparse');

// Read a csv file
const filePath = "assets/sample-csv-file.csv";

fs.readFile(filePath, 'utf8', (err, data)=>{
    if(err){
        console.log('Error reading the file: ', err.message);
        return;
    }

    // Parse csv data
    PapaParse.parse(data, {
        header: true,
        complete: (results) => {
            const data = results.data;
            console.log(data);
        },
        error: (err) => {
            console.log('Error parsing csv: ', err.message);
        }
    })
})