// var debug = require('debug')('got')
//     , got = require('got')
//     , name = 'My App';


// const debug = require('debug');
// const log = debug('got');
// const got = require('got');
// const name = 'Demo App for debug module';

const got = require('got');
var XDR = require('js-xdr');
import { toJSON } from 'json-xdr';
// import { toXDR } from 'json-xdr';
// import * as XDR from '/home/miq/node_modules/js-xdr/src/index';
// var debug = require('debug');
// const https = require('https')
// var base64js = require('base64-js');
const util = require('util');

var lordHostName = "sensorcloud.microstrain.com";

var auth_server;
var auth_token;
var auth_reserved;

// iqbal.tiro@gmail.com
// var device_id = "OAPI009ZGGUBW0CN";
// var key = "e087cb6ea7b36350f21986a0da2f3fbbbaf85f9fe4ebc67e1c0e68ba0e778a29"; 

// orangsoroako@gmail.com 
var device_id = "OAPI00D4CMV2RPWF";
var key = "2d73ff3acdf9adf70a0c7641c5c6c2e9d185cba06cdb42d1ca6ace5273fdec2b";
// # info for alternate method of authentication using username/password
// # (Needs to be enabled by user under permissions for the device)
var username = "your_username";
var password = "your_password";



var lordVersion = 1;
var sensor_name;
var channel_name;
var channel_label;
var channel_desc;

var SENSORS = new Object();


// // function to handle 'UnhandledRejection' error
// process.on('unhandledRejection', function (err) {
//     console.error(err);
// });


(async () => {

    var result;

    result = await Authenticate(device_id, key);

    if (result) { await GetSensor(device_id) }

    // if (result) { await DeleteChannel(device_id, sensor_name, channel_name) }

    // if (result) {
    //     await DeleteChannel(
    //         device_id,
    //         sensor_name = "Penggaron-Sensors",
    //         channel_name = "channel-2",
    //     )
    // }

    // if (result) {
    //     await AddChannel(
    //         device_id,
    //         sensor_name = "Penggaron-Sensors",
    //         channel_name = "channel-2",
    //         channel_label = "My channel label",
    //         channel_desc = "My channel decription",
    //     )
    // }


    // if (result) { await DeleteSensor(device_id, sensor_name) }

    // if (result) { await DeleteSensor(device_id, "SG-502") }

    // if (result) { await AddSensor(device_id, sensor_name, "Accelerometer", "Wisen", "This is my first SensorCloud Sensor") }

    var desc2 = "The Model 4000 Strain Gauge is designed \
        primarily for arc welding to steel structures such \
        as tunnel linings, excavation bracing, piles and bridges.";

    var desc3 = "The Model 4000 Strain Gauge is designed primarily for arc welding to steel structures such as tunnel linings, excavation bracing, piles and bridges.";
    var desc4 = "The Model 4000";
    // if (result) { await AddSensor(device_id, "Penggaron-Sensors", "Various Types", "My Sensor Label", desc2) }
    // if (result) { await AddSensor(device_id, "SG-502", "SG-502 Type", "SG-502 Label", "SG-502 Description") }

    // if (result) { await UpdateSensor(device_id, "SG-502", "", "", "") }
    // if (result) { await UpdateSensor(device_id, "Penggaron-Sensors", "Various Types", "My Sensor Label", desc4) }

    // var sampleData = GeneratingSampleData();

    // if (result) { await UploadData(device_id, sensor_name, channel_name, sampleData) }
    // if (result) { await UploadData(device_id, "Penggaron-Sensors", "channel-2", sampleData) }
    // if (result) { await UploadData(device_id, "SG-502", "channel-1", sampleData) }


    // if (result) { await GetSensor(device_id) }

})();



// Authenticate(device_id, key)
//     .then(function (result) {
//         return DeleteChannel(device_id, sensor_name, channel_name);
//     })
//     .then(newResult => DeleteSensor(device_id, sensor_name))
//     // .then(() => doFourthThing())
//     .catch(error => console.log(error));



async function Authenticate(device_id, key) {

    console.log('\r\n------------------------------ Authenticating ------------------------------');

    var response;

    const url_options = {
        hostname: lordHostName,
        // port: 443, // default to HTTPS, see: https://nodejs.org/api/https.html#https_https_request_options_callback
        path: `/SensorCloud/devices/${device_id}/authenticate/?version=1&key=${key}`,
        method: 'GET'
    };

    const req_options = {
        headers: {
            "accept": "application/xdr",
            // "accept": "application/json",
        },
        timeout: 5000,
        encoding: null,
    }

    await got(url_options, req_options)
        .then(function (response) {
            // console.log("Response:", response);
            if (response.statusCode == 200) {
                var acceptResponseHeader = req_options.headers['accept'] // application/json or application/xdr
                // console.log('GET accept header:', acceptResponseHeader);
                if (acceptResponseHeader === 'application/json') {
                    var credential = JSON.parse(response.body);
                    auth_token = credential.auth_token;
                    auth_server = credential.server;
                    console.log('auth_token\t:', auth_token);
                    console.log('auth_server\t:', auth_server);
                } else if (acceptResponseHeader === 'application/xdr') {
                    console.log('application/xdr');
                    var data = response.body;
                    let xdr = XDR.config((xdr) => {

                        xdr.struct('Signature', [
                            ["auth_token", xdr.string(1000)],
                            ["auth_server", xdr.string(1000)],
                            ["auth_reserved", xdr.string(1000)],
                        ]);
                    });

                    // // var sig = xdr.Signature.fromXDR(data);

                    // var constructedData = [].concat(arr);
                    var sig = xdr.Signature.fromXDR(data);

                    // console.log(sig);
                    var sigJson = toJSON(sig);

                    console.log(util.inspect(sigJson, { compact: false, breakLength: 100, depth: null, colors: true }));

                    var objToken = sig._attributes;
                    auth_server = objToken.auth_server.toString();
                    auth_token = objToken.auth_token.toString();
                    auth_reserved = objToken.auth_reserved.toString();
                }
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .catch(function (error) {
            console.log('Parsing auth_token & auth_server failed: ', error.message);
        });

    if (auth_token && auth_server) {
        console.log("Credentials parsed succesfully");
        return true;
    } else {
        console.log("Parsing auth_token & auth_server failed");
        return false;
    }
}

async function UploadData(device_id, sensor_name, channel_name, data) {
    console.log('\r\n------------------------------- Sending data -------------------------------');

    const url_options = {
        hostname: auth_server,
        // port: 443, // default to HTTPS, see: https://nodejs.org/api/https.html#https_https_request_options_callback
        path: `/SensorCloud/devices/${device_id}/sensors/${sensor_name}/channels/${channel_name}/streams/timeseries/data/?version=1&auth_token=${auth_token}`,
        method: 'POST'
    };

    const req_options = {
        headers: {
            "Content-Type": "application/xdr",
        },
        timeout: 20000,
        body: data
    }

    try {
        const query = got(url_options, req_options);
        const response = await query;
        console.log(response.statusCode, response.statusMessage);
        if (response.statusCode == 201) {
            console.log("Data uploaded succesfully")
            return true;
        } else {
            console.log("Data uploaded failed")
            return false;
        }
    } catch (error) {
        // console.error(error.body);
        // console.log(error);
        console.log(error.statusCode, error.body);
        return false;
    }
}

async function AddChannel(device_id, sensor_name, channel_name, channel_label, channel_desc) {
    console.log('\r\n------------------------------- Add Channel -------------------------------');

    let xdr = XDR.config((xdr) => {
        xdr.struct('Signature', [
            ['version', xdr.int()],
            ['channel_label', xdr.string()],
            ['channel_desc', xdr.string()],
        ]);
    });

    let data = new xdr.Signature();
    data.version(lordVersion);
    data.channel_label(channel_label);
    data.channel_desc(channel_desc);

    var dataXdr = data.toXDR();

    const url_options = {
        hostname: auth_server,
        // port: 443, // default to HTTPS, see: https://nodejs.org/api/https.html#https_https_request_options_callback
        path: `/SensorCloud/devices/${device_id}/sensors/${sensor_name}/channels/${channel_name}/?version=1&auth_token=${auth_token}`,
        method: 'PUT'
    };

    const req_options = {
        headers: {
            "Content-Type": "application/xdr",
        },
        timeout: 10000,
        body: dataXdr
    }

    try {
        const query = got(url_options, req_options);
        const response = await query;
        // console.log(response);
        console.log(response.statusCode, response.statusMessage);
        if (response.statusCode == 201) {
            console.log("Channel [%s] added successfuly", channel_name)
            return true;
        } else {
            console.log("Res. Failed adding channel [%s]", channel_name)
            return false;
        }
    } catch (error) {
        // console.error(error.body);
        // console.log(error);
        console.log(error.statusCode, error.body);
        console.log("Err. Failed adding channel [%s]", channel_name);
        return false;
    }
}

async function DeleteChannel(device_id, sensor_name, channel_name) {
    console.log('\r\n------------------------------- Delete Channel -------------------------------');

    const url_options = {
        hostname: auth_server,
        // port: 443, // default to HTTPS, see: https://nodejs.org/api/https.html#https_https_request_options_callback
        path: `/SensorCloud/devices/${device_id}/sensors/${sensor_name}/channels/${channel_name}/?version=1&auth_token=${auth_token}`,
        method: 'DELETE'
    };

    const req_options = {
        timeout: 5000,
    }

    try {
        const query = got(url_options, req_options);
        const response = await query;
        // console.log(response);
        console.log(response.statusCode, response.statusMessage);
        if (response.statusCode == 204) {
            console.log("Channel [%s] deleted successfuly", channel_name)
            return true;
        } else {
            console.log("Failed deleting channel [%s]", channel_name)
            return false;
        }
    } catch (error) {
        // console.error(error.body);
        // console.log(error);
        console.log(error.statusCode, error.body);
        console.log("Failed deleting channel [%s]", channel_name);
        return false;
    }
}

async function AddSensor(device_id, sensor_name, sensor_type, sensor_label, sensor_desc) {
    console.log('\r\n------------------------------- Add Sensor -------------------------------');

    let xdr = XDR.config((xdr) => {
        xdr.struct('Signature', [
            ['version', xdr.int()],
            ['sensor_type', xdr.string()],
            ['sensor_label', xdr.string()],
            ['sensor_desc', xdr.string()],
        ]);
    });

    let data = new xdr.Signature();
    data.version(lordVersion);
    data.sensor_type(sensor_type);
    data.sensor_label(sensor_label);
    data.sensor_desc(sensor_desc);

    var dataXdr = data.toXDR();

    // console.log(sig.toXDR());

    const url_options = {
        hostname: auth_server,
        // port: 443, // default to HTTPS, see: https://nodejs.org/api/https.html#https_https_request_options_callback
        path: `/SensorCloud/devices/${device_id}/sensors/${sensor_name}/?version=1&auth_token=${auth_token}`,
        method: 'PUT'
    };

    const req_options = {
        headers: {
            "Content-Type": "application/xdr",
        },
        timeout: 20000,
        body: dataXdr
    }

    try {
        const query = got(url_options, req_options);
        const response = await query;
        // console.log(response);
        console.log(response.statusCode, response.statusMessage);
        if (response.statusCode == 201) {
            console.log("Sensor [%s] added successfuly", sensor_name)
            return true;
        } else {
            console.log("Failed adding sensor [%s]", sensor_name)
            return false;
        }
    } catch (error) {
        // console.error(error.body);
        // console.log(error);
        console.log(error.statusCode, error.body);
        console.log("Failed adding sensor [%s]", sensor_name);
        return false;
    }
}

async function UpdateSensor(device_id, sensor_name, sensor_type, sensor_label, sensor_desc) {
    console.log('\r\n------------------------------- Update Sensor -------------------------------');

    let xdr = XDR.config((xdr) => {
        xdr.struct('Signature', [
            ['version', xdr.int()],
            ['sensor_type', xdr.string()],
            ['sensor_label', xdr.string()],
            ['sensor_desc', xdr.string()],
        ]);
    });

    let data = new xdr.Signature();
    data.version(lordVersion);
    data.sensor_type(sensor_type);
    data.sensor_label(sensor_label);
    data.sensor_desc(sensor_desc);

    var dataXdr = data.toXDR();

    // console.log(sig.toXDR());

    const url_options = {
        hostname: auth_server,
        // port: 443, // default to HTTPS, see: https://nodejs.org/api/https.html#https_https_request_options_callback
        path: `/SensorCloud/devices/${device_id}/sensors/${sensor_name}/?version=1&auth_token=${auth_token}`,
        method: 'POST'
    };

    const req_options = {
        headers: {
            "Content-Type": "application/xdr",
        },
        timeout: 20000,
        body: dataXdr
    }

    try {
        const query = got(url_options, req_options);
        const response = await query;
        // console.log(response);
        console.log(response.statusCode, response.statusMessage);
        if (response.statusCode == 201) {
            console.log("Sensor [%s] updated successfuly", sensor_name)
            return true;
        } else {
            console.log("Failed updating sensor [%s]", sensor_name)
            return false;
        }
    } catch (error) {
        // console.error(error.body);
        // console.log(error);
        console.log(error.statusCode, error.body);
        console.log("Failed updating sensor [%s]", sensor_name);
        return false;
    }
}

async function DeleteSensor(device_id, sensor_name) {
    console.log('\r\n------------------------------- Delete Sensor -------------------------------');

    const url_options = {
        hostname: auth_server,
        // port: 443, // default to HTTPS, see: https://nodejs.org/api/https.html#https_https_request_options_callback
        path: `/SensorCloud/devices/${device_id}/sensors/${sensor_name}/?version=1&auth_token=${auth_token}`,
        method: 'DELETE'
    };

    const req_options = {
        // timeout: 5000,
    }

    try {
        const query = got(url_options, req_options);
        const response = await query;
        // console.log(response);
        console.log(response.statusCode, response.statusMessage);
        if (response.statusCode == 204) {
            console.log("Sensor [%s] deleted successfuly", sensor_name)
            return true;
        } else {
            console.log("Res. Failed deleting sensor [%s]", sensor_name)
            return false;
        }
    } catch (error) {
        // console.error(error.body);
        // console.log(error);
        console.log(error.statusCode, error.body);
        console.log("Err. Failed deleting sensor [%s]", sensor_name);
        return false;
    }
}



async function GetSensor(device_id) {
    console.log('\r\n------------------------------- Get Sensor -------------------------------');

    const url_options = {
        hostname: auth_server,
        // port: 443, // default to HTTPS, see: https://nodejs.org/api/https.html#https_https_request_options_callback
        path: `/SensorCloud/devices/${device_id}/sensors/?version=1&auth_token=${auth_token}`,
        method: 'GET'
    };

    const req_options = {
        headers: {
            "Accept": "application/xdr",
        },
        timeout: 20000,
        // responseType: "buffer",
        encoding: null,
    }

    var response;
    try {
        const query = got(url_options, req_options);
        response = await query;
    } catch (error) {
        // console.error(error.body);
        console.log(error);
        // console.log(error.statusCode, error.body);
        console.log("Err. Failed retrieving sensor info");
        // return false;
    }

    if (response.statusCode == 200) {
        // console.log(response);

        var data = response.body;
        console.log('data.length', data.length);
        // console.log(data);

        let xdr = XDR.config((xdr) => {
            xdr.struct("Units", [
                ["stored_unit", xdr.string(1000)],
                ["preferred_unit", xdr.string(1000)],
                ["unit_timestamp", xdr.uhyper()],
                ["slope", xdr.float()],
                ["offset", xdr.float()],
            ]);

            xdr.struct("Streams", [
                ["stream_type", xdr.string(1000)],
                ["total_bytes", xdr.int()],
                ["units", xdr.varArray(xdr.lookup("Units"))],
            ]);

            xdr.struct("Channels", [
                // ["streams", xdr.string(1000)],
                ["name", xdr.string(1000)],
                ["label", xdr.string(1000)],
                ["desc", xdr.string(1000)],
                ["streams", xdr.varArray(xdr.lookup("Streams"))],
            ]);

            xdr.struct("Sensors", [
                ["name", xdr.string(1000)],
                ["type", xdr.string(1000)],
                ["label", xdr.string(1000)],
                ["desc", xdr.string(1000)],
                ["channels", xdr.varArray(xdr.lookup("Channels"))],
            ]);

            xdr.struct('Signature', [
                ['version', xdr.int()],
                ["sensors", xdr.varArray(xdr.lookup("Sensors"))],
            ]);
        });

        var sig = xdr.Signature.fromXDR(data);

        SENSORS = toJSON(sig);



        // console.log(sig);
        // console.log(util.inspect(sig, { compact: false, breakLength: 100, depth: null, colors: true }));
        console.log(util.inspect(SENSORS, { compact: false, breakLength: 100, depth: null, colors: true }));

    }
}

function GeneratingSampleData() {

    console.log('\r\n------------------------------ Generating data ------------------------------');

    // parameter
    var lordVersion = 1;
    var lordRateType = 1; // HERTZ
    var lordSampleRate = 5
    var lordPOINTS = 10000;

    var construct = [];
    construct.push(XDR.Int.toXDR(lordVersion));
    construct.push(XDR.Int.toXDR(lordRateType));
    construct.push(XDR.Int.toXDR(lordSampleRate));
    construct.push(XDR.Int.toXDR(lordPOINTS));

    var timestamp_nanoseconds = Date.now() * 1000000;

    var sampleInterval_nanoseconds;

    if (lordRateType == 1 || lordRateType === 'HERTZ') {
        sampleInterval_nanoseconds = (1 / lordSampleRate) * 1000000000;
    }


    for (var i = 0; i < lordPOINTS; i++) {
        var t = timestamp_nanoseconds.toString(10);
        var t_xdr = (XDR.UnsignedHyper.fromString(t)).toXDR();

        var val = Math.sin(timestamp_nanoseconds / 20000000000.0);
        var val_xdr = XDR.Float.toXDR(val);

        construct.push(t_xdr);
        construct.push(val_xdr);

        timestamp_nanoseconds += sampleInterval_nanoseconds;
    }

    var constructedData = Buffer.concat(construct);

    console.log(constructedData);
    console.log('length', constructedData.toString('ascii').length);

    return constructedData;
}

