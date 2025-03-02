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
    console.log('Changing Status ');
    global.interrupt = 0x50 ;
    //if there is already an interrupt . we should handle that TODO:

});

app.get('/changeGreen/B', (req, res) => {
    console.log('Changing Status ');
    global.interrupt = 0x51 ;

});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});



// Start the API server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
