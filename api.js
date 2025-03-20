const express = require('express');
const app = express();
const port = 3000;
const path = require('path');


app.use(express.json());




app.get('/status/A', (req, res) => {
    console.log('current STATUS OF A is :',global.A_Status);
    res.json({ A_Status: global.A_Status });

});

app.get('/status/B', (req, res) => {
    console.log('current STATUS OF B is :',global.B_Status);
    res.json({ B_Status: global.B_Status });

});

app.get('/changeGreen/A', (req, res) => {
    console.log('Api /changeGreen/A is Triggered  ');

    if (global.interrupt !== 0x00) {
        console.log('There is already another Interrupt');
        return res.send("Interrupt already set!");
    }

    global.interrupt = 0x50 ;
  

});

app.get('/changeGreen/B', (req, res) => {
    if (global.interrupt !== 0x00) {
        console.log('There is already another Interrupt');
        return res.send("Interrupt already set!");
        
    }
    console.log('Changing Status ');
    global.interrupt = 0x51 ;

});


app.get('/fixGreen/A', (req, res) => {
    if (global.interrupt !== 0x00) {
        console.log('There is already another Interrupt');
        return res.send("Interrupt already set!");
    }
    console.log('Fixing A to Green ');
    global.interrupt = 0x60 ;

});


app.get('/fixGreen/B', (req, res) => {
    if (global.interrupt !== 0x00) {
        console.log('There is already another Interrupt');
        return res.send("Interrupt already set!");
    }
    console.log('Fixing B To Green  ');
    global.interrupt = 0x61 ;

});

app.get('/reset', (req, res) => {
    console.log('Changing Status ');
    global.interrupt = 0x00 ;

});







app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



// Start the API server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
