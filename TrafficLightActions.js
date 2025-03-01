async function goRed(socket, lightID) {
    if (lightID === "A2") {
        global.keepAliveA = false;
    } else if (lightID === "B2") {
        global.keepAliveB = false;
    }

    if (!socket) {
        global.stopLoop = true;
        return false;
    }

    console.log("🔴 Sending Red Signal (0x21)...");
    socket.write(Buffer.from([0x21]));
    // await sleep(200);

    return new Promise((resolve) => {
        setTimeout(() => {
            if ((lightID === "A2" && global.keepAliveA) || (lightID === "B2" && global.keepAliveB)) {
                console.log(`✅ ${lightID} responded.`);
                resolve(true);
            } else {
                console.log(`❌ ${lightID} did NOT respond in time!`);
                global.stopLoop = true;
                resolve(false);
            }
        }, 500);
    });
}

async function goYellow(socket, lightID) {
    if (lightID === "A2") {
        global.keepAliveA = false;
    } else if (lightID === "B2") {
        global.keepAliveB = false;
    }

    if (!socket) {
        global.stopLoop = true;
        return false;
    }

    console.log("🟠 Sending Yellow Signal (0x23)...");
    socket.write(Buffer.from([0x23]));
    // await sleep(1000);

    return new Promise((resolve) => {
        setTimeout(() => {
            if ((lightID === "A2" && global.keepAliveA) || (lightID === "B2" && global.keepAliveB)) {
                console.log(`✅ ${lightID} responded.`);
                resolve(true);
            } else {
                console.log(`❌ ${lightID} did NOT respond in time!`);
                global.stopLoop = true;
                resolve(false);
            }
        }, 500);
    });
}

async function goGreen(socket, lightID) {
    if (lightID === "A2") {
        global.keepAliveA = false;
    } else if (lightID === "B2") {
        global.keepAliveB = false;
    }

    if (!socket) {
        global.stopLoop = true;
        return false;
    }

    console.log("🟢 Sending Green Signal (0x22)...");
    socket.write(Buffer.from([0x22]));
    // await sleep(200);

    return new Promise((resolve) => {
        setTimeout(() => {
            if ((lightID === "A2" && global.keepAliveA) || (lightID === "B2" && global.keepAliveB)) {
                console.log(`✅ ${lightID} responded.`);
                resolve(true);
            } else {
                console.log(`❌ ${lightID} did NOT respond in time!`);
                global.stopLoop = true;
                resolve(false);
            }
        }, 500);
    });
}

function goBlink(socket) {
    if (!socket) {
        console.log('No client to send red signal');
        return;
    }
    socket.write(Buffer.from([0x23]));
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
