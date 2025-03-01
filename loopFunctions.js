const { goRed, goYellow, goGreen, goBlink } = require('./trafficLightActions');


function handleInterrupt(){

    switch (global.interrupt) {
        case 0x50:
            switch (global.currentLight) {
                case 'A':
                  if (global.A_Status == 0x00) {
                    goYellow(global.socketA);
                    sleep(2000);
                    goGreen(global.socketA);
                    sleep(10000);
                    goYellow(global.socketA);
                    sleep(2000);
                    goRed(global.socketA);


                    global.currentLight = 'B';

                    resetBegin();

                  }
                  else if (global.A_Status == 0x01) {
                    sleep(1000);
                    goGreen(global.socketA);
                    sleep(10000);
                    goYellow(global.socketA);
                    sleep(2000);
                    goRed(global.socketA);

                    global.currentLight = 'B';

                    resetBegin();

                  }
                  else if (global.A_Status == 0x02) {
                    sleep(10000);
                    goYellow(global.socketA);
                    sleep(2000);
                    goRed(global.socketA);

                    global.currentLight = 'B';

                    resetBegin();

                  }
                  else if (global.A_Status == 0x03) {
                    goRed(global.socketA);
                    sleep(1000);
                    goYellow(global.socketA);
                    sleep(2000);
                    goGreen(global.socketA);
                    sleep(10000);
                    goYellow(global.socketA);
                    sleep(2000);
                    goRed(global.socketA);


                    global.currentLight = 'B';


                    resetBegin();

                  }
                  break;
                case 'B':
                  if (global.B_Status == 0x00) {
                    global.currentLight = 'A';


                    resetBegin();
                  }
                  else if (global.B_Status == 0x01) {
                    // B go green , Yellow , AND RED
                    goGreen(global.socketB);
                    sleep(3000);
                    goYellow(global.socketB);
                    sleep(2000);
                    goRed(global.socketB);
                    console.log('interrupt 0x50 .. B go green , Yellow , AND RED  ');
                    global.currentLight = 'A';

                    resetBegin();
                  }
                  else if (global.B_Status == 0x02) {
                    console.log('interrupt 0x50 .. B go  Yellow , AND RED  ');
                    goYellow(global.socketB);
                    sleep(2000);
                    goRed(global.socketB);
                    global.currentLight = 'A';

                    resetBegin();


                  }
                  else if (global.A_Status == 0x03) {
                    // B GOES RED ;

                    global.currentLight = 'A';

                    resetBegin();

                  }
                  break;





              }

        case 0x51:
        switch (global.currentLight) {
            case 'A':
              if (global.A_Status == 0x00) {
                global.currentLight = 'B';


              }
              else if (global.A_Status == 0x01) {
                    goGreen(global.socketA);
                    sleep(3000);
                    goYellow(global.socketA);
                    sleep(2000);
                    goRed(global.socketA);
                    global.currentLight = 'B';

                    resetBegin();

              }
              else if (global.A_Status == 0x02) {
                    goYellow(global.socketA);
                    sleep(2000);
                    goRed(global.socketA);
                    global.currentLight = 'B';

                    resetBegin();

              }
              else if (global.A_Status == 0x03) {

                global.currentLight = 'B';

                resetBegin();

              }
              break;
            case 'B':
              if (global.B_Status == 0x00) {
                    goYellow(global.socketB);
                    sleep(2000);
                    goGreen(global.socketB);
                    sleep(10000);
                    goYellow(global.socketB);
                    sleep(2000);
                    goRed(global.socketB);

                    global.interrupt = 0x00;
                    global.A_Status == 0x00
                    global.B_Status == 0x00
                    resetBegin();
              }
              else if (global.B_Status == 0x01) {
                    sleep(1000);
                    goGreen(global.socketB);
                    sleep(10000);
                    goYellow(global.socketB);
                    sleep(2000);
                    goRed(global.socketB);

                    resetBegin();
              }
              else if (global.B_Status == 0x02) {
                sleep(10000);
                goYellow(global.socketB);
                sleep(2000);
                goRed(global.socketB);

                resetBegin();


              }
              else if (global.B_Status == 0x03) {
                    goRed(global.socketB);
                    sleep(1000);
                    goYellow(global.socketB);
                    sleep(2000);
                    goGreen(global.socketB);
                    sleep(10000);
                    goYellow(global.socketB);
                    sleep(2000);
                    goRed(global.socketB);


                    global.currentLight = 'A';


                    resetBegin();


              }
              break;





          }







        break;
        default:
          console.log('cant understand interrupt Value', global.interrupt);
          break;





      }

}

function resetBegin() {

    remainingTime_A = 3000;
    // previousTime_A = Date.now();
    remainingTime_B = 3000;
    // previousTime_B = Date.now();
    global.interrupt = 0x00;
    global.A_Status = 0x00
    global.B_Status = 0x00
  }


  function sleep(milliseconds) {
    const start = Date.now();
    while (Date.now() - start < milliseconds) {
      // Block the code for the specified time
    }
  }

module.exports = { handleInterrupt , resetBegin , sleep }; // Export the function
