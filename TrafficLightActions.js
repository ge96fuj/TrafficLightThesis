async function goRed(socket, lightID) {

    if (!socket) {
        global.stopLoop = true;
        return false;
    }

    console.log("🔴 Sending Red Signal (0x21)...");
    socket.write(Buffer.from([0x21]));


    
}

async function goYellow(socket, lightID) {
    if (!socket) {
        global.stopLoop = true;
        return false;
    }
    console.log("🟠 Sending Yellow Signal (0x23)...");
    socket.write(Buffer.from([0x23]));
    // await sleep(1000);
}

async function goGreen(socket, lightID) {
    if (!socket) {
        global.stopLoop = true;
        return false;
    }

    console.log("🟢 Sending Green Signal (0x22)...");
    socket.write(Buffer.from([0x22]));
    // await sleep(200);

   
}

function goBlink(socket,lightID) {
    console.log("BLINK BEGIN")
   

    if (!socket) {
        console.log("!socket" , lightID);
        global.stopLoop = true;
        return false;
        
    }

    console.log("🟠🟠🟠  Sending BLINK Signal (0x25)...TO" , lightID);
    socket.write(Buffer.from([0x25]));
    // await sleep(200);

}

function sendKeepAlive(socket, lightID) {
    return new Promise((resolve) => {
        if (!socket || socket.destroyed) {
            console.log(`⚠️ ${lightID} is disconnected.`);
            return resolve(false);
        }

        if (lightID === "A2") {
            global.keepAliveA = false;
        } else if (lightID === "B2") {
            global.keepAliveB = false;
        }

        try {
            console.log(`📡 Sending Keep-Alive to ${lightID}`);
            socket.write(Buffer.from([0x50]));

            setTimeout(() => {
                if ((lightID === "A2" && global.keepAliveA) || (lightID === "B2" && global.keepAliveB)) {
                    console.log(`✅ ${lightID} is still connected.`);
                    resolve(true);
                } else {
                    console.log(`❌ ${lightID} did Not respond in time!`);
                    resolve(false);
                }
            }, 2000);
        } catch (err) {
            console.log(`❌ Failed to send Keep-Alive to ${lightID}: ${err.message}`);
            resolve(false);
        }
    });
}

function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

module.exports = { goRed, goYellow, goGreen, goBlink, sendKeepAlive };
