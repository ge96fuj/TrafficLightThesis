const { goRed, goYellow, goGreen, goBlink } = require('./TrafficLightActions');
global.currentLight = 'S';

async function handleInterrupt() {
  switch (global.interrupt) {
    case 0x50:
      switch (global.currentLight) {
        case 'A':
          if (global.A_Status == 0x00) {
            await goYellow(global.socketA, "A2");
            global.A_Status = 0x01;
            await sleep(2000);
            await goGreen(global.socketA, "A2");
            global.A_Status = 0x02;
            await sleep(10000);
            await goYellow(global.socketA, "A2");
            global.A_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketA, "A2");
            global.A_Status = 0x00;

            global.currentLight = 'B';
            resetBegin();
          } else if (global.A_Status == 0x01) {
            await sleep(1000);
            await goGreen(global.socketA, "A2");
            global.A_Status = 0x02;
            await sleep(10000);
            await goYellow(global.socketA, "A2");
            global.A_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketA, "A2");
            global.A_Status = 0x00;

            global.currentLight = 'B';
            resetBegin();
          } else if (global.A_Status == 0x02) {
            await sleep(10000);
            await goYellow(global.socketA, "A2");
            global.A_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketA, "A2");
            global.A_Status = 0x00;

            global.currentLight = 'B';
            resetBegin();
          } else if (global.A_Status == 0x03) {
            await goRed(global.socketA, "A2");
            global.A_Status = 0x00;
            await sleep(1000);
            await goYellow(global.socketA, "A2");
            global.A_Status = 0x01;
            await sleep(2000);
            await goGreen(global.socketA, "A2");
            global.A_Status = 0x02;
            await sleep(10000);
            await goYellow(global.socketA, "A2");
            global.A_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketA, "A2");
            global.A_Status = 0x00;

            global.currentLight = 'B';
            resetBegin();
          }
          break;

        case 'B':
          if (global.B_Status == 0x00) {
            global.currentLight = 'A';
            resetBegin();
          } else if (global.B_Status == 0x01) {
            await goGreen(global.socketB, "B2");
            global.B_Status = 0x02;
            await sleep(3000);
            await goYellow(global.socketB, "B2");
            global.B_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketB, "B2");
            global.B_Status = 0x00;
            console.log('interrupt 0x50 .. B go green, Yellow, AND RED');

            global.currentLight = 'A';
            resetBegin();
          } else if (global.B_Status == 0x02) {
            console.log('interrupt 0x50 .. B go Yellow, AND RED');
            await goYellow(global.socketB, "B2");
            global.B_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketB, "B2");
            global.B_Status = 0x00;
            global.currentLight = 'A';
            console.log('Current light in interrupt handler is', global.currentLight);
            resetBegin();
          } else if (global.B_Status == 0x03) {
            await goRed(global.socketB, "B2");
            global.B_Status = 0x00;
            global.currentLight = 'A';
            resetBegin();
          }
          break;
      }
      break;

    case 0x51:

      switch (global.currentLight) {
        case 'A':
          if (global.A_Status == 0x00) {
            global.currentLight = 'B';
          } else if (global.A_Status == 0x01) {
            await goGreen(global.socketA, "A2");
            global.A_Status = 0x02;
            await sleep(3000);
            await goYellow(global.socketA, "A2");
            global.A_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketA, "A2");
            global.A_Status = 0x00;
            global.currentLight = 'B';
            resetBegin();
          } else if (global.A_Status == 0x02) {
            await goYellow(global.socketA, "A2");
            global.A_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketA, "A2");
            global.A_Status = 0x00;
            global.currentLight = 'B';
            resetBegin();
          } else if (global.A_Status == 0x03) {
            await goRed(global.socketA, "A2");
            global.A_Status = 0x00;
            global.currentLight = 'B';
            resetBegin();
          }
          break;

        case 'B':
          if (global.B_Status == 0x00) {
            await goYellow(global.socketB, "B2");
            global.B_Status = 0x01;
            await sleep(2000);
            await goGreen(global.socketB, "B2");
            global.B_Status = 0x02;
            await sleep(10000);
            await goYellow(global.socketB, "B2");
            global.B_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketB, "B2");
            global.B_Status = 0x00;

            global.interrupt = 0x00;
            global.A_Status = 0x00;
            global.B_Status = 0x00;
            resetBegin();
          } else if (global.B_Status == 0x01) {
            await sleep(1000);
            await goGreen(global.socketB, "B2");
            global.B_Status = 0x02;
            await sleep(10000);
            await goYellow(global.socketB, "B2");
            global.B_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketB, "B2");
            global.B_Status = 0x00;

            resetBegin();
          } else if (global.B_Status == 0x02) {
            await sleep(10000);
            await goYellow(global.socketB, "B2");
            global.B_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketB, "B2");
            global.B_Status = 0x00;

            resetBegin();
          } else if (global.B_Status == 0x03) {
            await goRed(global.socketB, "B2");
            global.B_Status = 0x00;
            await sleep(1000);
            await goYellow(global.socketB, "B2");
            global.B_Status = 0x01;
            await sleep(2000);
            await goGreen(global.socketB, "B2");
            global.B_Status = 0x02;
            await sleep(10000);
            await goYellow(global.socketB, "B2");
            global.B_Status = 0x03;
            await sleep(2000);
            await goRed(global.socketB, "B2");
            global.B_Status = 0x00;

            global.currentLight = 'A';
            resetBegin();
          }
          break;
      }
      break;

    case 0x60:

    switch (global.currentLight) {
      case 'A':
        if (global.A_Status == 0x00) {
          await goYellow(global.socketA, "A2");
          global.A_Status = 0x01;
          await sleep(2000);
          await goGreen(global.socketA, "A2");
          global.A_Status = 0x02;
          //wait for another interrupt 
          while (global.interrupt != 0x00) {
            await sleep(500);
          }
          await goYellow(global.socketA, "A2");
          await sleep(1000);
          await goRed(global.socketA, "A2");
          global.currentLight = 'B';
          resetBegin();
        } else if (global.A_Status == 0x01) {
          await sleep(1000);
          await goGreen(global.socketA, "A2");
          global.A_Status = 0x02;

          while (global.interrupt != 0x00) {
            await sleep(500);
          }

          await goYellow(global.socketA, "A2");
          global.A_Status = 0x03;
          await sleep(2000);
          await goRed(global.socketA, "A2");
          global.A_Status = 0x00;

          global.currentLight = 'B';
          resetBegin();
        } else if (global.A_Status == 0x02) {

           while (global.interrupt != 0x00) {
            await sleep(500);
          }

          await goYellow(global.socketA, "A2");
          global.A_Status = 0x03;
          await sleep(2000);
          await goRed(global.socketA, "A2");
          global.A_Status = 0x00;

          global.currentLight = 'B';
          resetBegin();
        } else if (global.A_Status == 0x03) {
          await goRed(global.socketA, "A2");
          global.A_Status = 0x00;
          await sleep(1000);
          await goYellow(global.socketA, "A2");
          global.A_Status = 0x01;
          await sleep(2000);
          await goGreen(global.socketA, "A2");
          global.A_Status = 0x02;
          while (global.interrupt != 0x00) {
            await sleep(500);
          }
          await goYellow(global.socketA, "A2");
          global.A_Status = 0x03;
          await sleep(2000);
          await goRed(global.socketA, "A2");
          global.A_Status = 0x00;

          global.currentLight = 'B';
          resetBegin();
        }
        break;

      case 'B':
        if (global.B_Status == 0x00) {
          await goYellow(global.socketA, "A2");
          global.A_Status = 0x01;
          await sleep(2000);
          await goGreen(global.socketA, "A2");
          global.A_Status = 0x02;
          //wait for another interrupt 
          while (global.interrupt != 0x00) {
            await sleep(500);

          }
          await goYellow(global.socketA, "A2");
          await sleep(1000);
          await goRed(global.socketA, "A2");

          global.currentLight = 'B';
          resetBegin();

   
        } else if (global.B_Status == 0x01) {
          await goGreen(global.socketB, "B2");
          global.B_Status = 0x02;
          await sleep(2000);
          await goYellow(global.socketB, "B2");
          global.B_Status = 0x03;
          await sleep(1000);
          await goRed(global.socketB, "B2");
          global.B_Status = 0x00;

          await goYellow(global.socketA, "A2");
          global.A_Status = 0x01;
          await sleep(2000);
          await goGreen(global.socketA, "A2");
          global.A_Status = 0x02;
          //wait for another interrupt 
          while (global.interrupt != 0x00) {
            await sleep(500);

          }
          await goYellow(global.socketA, "A2");
          await sleep(1000);
          await goRed(global.socketA, "A2");

          global.currentLight = 'B';
          resetBegin();

        } else if (global.B_Status == 0x02) {
          console.log('interrupt 0x50 .. B go Yellow, AND RED');
          await goYellow(global.socketB, "B2");
          global.B_Status = 0x03;
          await sleep(2000);
          await goRed(global.socketB, "B2");

          await goYellow(global.socketA, "A2");
          global.A_Status = 0x01;
          await sleep(2000);
          await goGreen(global.socketA, "A2");
          global.A_Status = 0x02;
          //wait for another interrupt 
          while (global.interrupt != 0x00) {
            await sleep(500);

          }
          await goYellow(global.socketA, "A2");
          await sleep(1000);
          await goRed(global.socketA, "A2");
          global.currentLight = 'B';
          
          resetBegin();
        } else if (global.B_Status == 0x03) {
          await goRed(global.socketB, "B2");
          global.B_Status = 0x00;
          await goYellow(global.socketA, "A2");
          global.A_Status = 0x01;
          await sleep(2000);
          await goGreen(global.socketA, "A2");
          global.A_Status = 0x02;
          //wait for another interrupt 
          while (global.interrupt != 0x00) {
            await sleep(500);
          }
          await goYellow(global.socketA, "A2");
          global.A_Status = 0x03
          await sleep(1000);
          await goRed(global.socketA, "A2" )
          global.A_Status = 0x00
          global.currentLight = 'B';
          resetBegin();
        }
        break;
    }
    break;
      
    case 0x61:  
    switch (global.currentLight) {
      case 'A':
        if (global.A_Status == 0x00) {
          await goYellow(global.socketA, "B2");
          global.B_Status = 0x01;
          await goGreen(global.socketA, "B2");
          global.B_Status = 0x02;
          while (global.interrupt != 0x00) {
            await sleep(500);
          }
          await goYellow(global.socketA, "B2");
          global.B_Status = 0x03;
          await goRed(global.socketA, "B2");
          global.B_Status = 0x00;         
          global.currentLight = 'A';
          resetBegin();
        } else if (global.A_Status == 0x01) {
          await goGreen(global.socketA, "A2");
          global.A_Status = 0x02;
          await sleep(2000);
          await goYellow(global.socketA, "A2");
          global.A_Status = 0x03;
          await sleep(2000);
          await goRed(global.socketA, "A2");

          await goYellow(global.socketA, "B2");
          global.B_Status = 0x01;
          await sleep(1000);
          await goGreen(global.socketA, "B2");
          global.B_Status = 0x02;
          while (global.interrupt != 0x00) {
            await sleep(500);
          }
          await goYellow(global.socketA, "B2");
          global.B_Status = 0x03;
          await sleep(1000);
          await goRed(global.socketA, "B2");
          global.B_Status = 0x00;         
          global.currentLight = 'A';
          resetBegin();

        } else if (global.A_Status == 0x02) {
          await goYellow(global.socketA, "A2");
          global.A_Status = 0x03;
          await sleep(1000);
          await goRed(global.socketA, "A2");
          global.A_Status = 0x00;
          await goYellow(global.socketA, "B2");
          global.B_Status = 0x01;
          await sleep(1000);
          await goGreen(global.socketA, "B2");
          global.B_Status = 0x02;
          while (global.interrupt != 0x00) {
            await sleep(500);
          }
          await goYellow(global.socketA, "B2");
          global.B_Status = 0x03;
          await sleep(1000);
          await goRed(global.socketA, "B2");
          global.B_Status = 0x00;         
          global.currentLight = 'A';
          resetBegin();


          




        } else if (global.A_Status == 0x03) {
          await goRed(global.socketA, "A2");
          global.A_Status = 0x00;
          await sleep(1000);
          await goYellow(global.socketA, "B2");
          global.B_Status = 0x01;
          await sleep(1000);
          await goGreen(global.socketA, "B2");
          global.B_Status = 0x02;
          while (global.interrupt != 0x00) {
            await sleep(500);
          }
          await goYellow(global.socketA, "B2");
          global.B_Status = 0x03;
          await sleep(1000);
          await goRed(global.socketA, "B2");
          global.B_Status = 0x00;         
          global.currentLight = 'A';
          resetBegin();
          await sleep(1000);
        }
        break;

      case 'B':
        if (global.B_Status == 0x00) {
          await goYellow(global.socketB, "B2");
          global.B_Status = 0x01;
          await sleep(2000);
          await goGreen(global.socketB, "B2");
          global.B_Status = 0x02;
          while (global.interrupt != 0x00) {
            await sleep(500);
          }
          await goYellow(global.socketB, "B2");
          global.B_Status = 0x03;
          await sleep(2000);
          await goRed(global.socketB, "B2");
          global.B_Status = 0x00;
          resetBegin();
        } else if (global.B_Status == 0x01) {
          await sleep(1000);
          await goGreen(global.socketB, "B2");
          global.B_Status = 0x02;
          while (global.interrupt != 0x00) {
            await sleep(500);
          }          
          await goYellow(global.socketB, "B2");
          global.B_Status = 0x03;
          await sleep(2000);
          await goRed(global.socketB, "B2");
          global.B_Status = 0x00;
          global.currentLight = 'A';


          resetBegin();
        } else if (global.B_Status == 0x02) {
          while (global.interrupt != 0x00) {
            await sleep(500);
          }        
          await goYellow(global.socketB, "B2");
          global.B_Status = 0x03;
          await sleep(2000);
          await goRed(global.socketB, "B2");
          global.B_Status = 0x00;
          global.currentLight = 'A';

          resetBegin();
        } else if (global.B_Status == 0x03) {
          await goRed(global.socketB, "B2");
          global.B_Status = 0x00;
          await sleep(1000);
          await goYellow(global.socketB, "B2");
          global.B_Status = 0x01;
          await sleep(2000);
          await goGreen(global.socketB, "B2");
          global.B_Status = 0x02;
          while (global.interrupt != 0x00) {
            await sleep(500);
          }
          await goYellow(global.socketB, "B2");
          global.B_Status = 0x03;
          await sleep(2000);
          await goRed(global.socketB, "B2");
          global.B_Status = 0x00;

          global.currentLight = 'A';
          resetBegin();
        }
        break;
    }
    break;
  
    default:
      console.log('❌ Cannot understand interrupt Value:', global.interrupt);
      break;
  }
}

function resetBegin() {
  remainingTime_A = 3000;
  remainingTime_B = 3000;
  global.interrupt = 0x00;
  global.A_Status = 0x00;
  global.B_Status = 0x00;
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { handleInterrupt, resetBegin, sleep };
