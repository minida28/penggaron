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
var base64js = require('base64-js')
const fetch = require("node-fetch");

var lordHostName = "sensorcloud.microstrain.com";

var auth_server = 'dsx.sensorcloud.microstrain.com';
var auth_token = 'ob8efa9ca598ca6ec4b1f90af04b2000abeff8d8211dfbeb718';

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
        },
        timeout: 5000,
    }

    try {
        const authenticate_key = got(url_options, req_options);

        response = await authenticate_key;

        console.log(response.statusCode, response.statusMessage);

        if (response.statusCode == 200) {
            var acceptResponseHeader = req_options.headers['accept'] // application/json or application/xdr
            // console.log('GET accept header:', acceptResponseHeader);
            if (acceptResponseHeader === 'application/json') {
                var credential = JSON.parse(response.body);
                auth_token = credential.auth_token;
                auth_server = credential.server;
                console.log('auth_token\t:', auth_token);
                console.log('auth_server\t\t:', auth_server);
            } else if (acceptResponseHeader === 'application/xdr') {
                // var buffer = Buffer.from(response.body);
                var data = response.body;
                // console.log(data);
                var buf = Buffer.from(data);
                // console.log('buf', buf);
                var splitArr = data.toString();
                // console.log(splitArr);
                var arr = [];
                for (var i = 0; i < buf.length; i++) {
                    var c = buf[i];
                    if (c >= 32) {
                        // console.log(c);
                        arr.push(String.fromCharCode(c));
                    } else {
                        var hexString = c.toString(16);
                        var yourNumber = '0x' + hexString;
                        // console.log(yourNumber);
                        arr.push(yourNumber);
                    }
                }
                // console.log(arr.join());

                let subject = new XDR.String();
                // console.log(subject);

                var str = subject.fromXDR(buf);

                auth_token = str.toString();
                console.log('auth_token\t[%s]', auth_token);



                // get how many actual bytes consumed by 1st string
                // but the string has to be returned back to XDR format 
                var temp = subject.toXDR(str.toString());

                // then get the actual lenght of the 1st string in XDR format
                var len_xdr_1 = Buffer.byteLength(temp);

                // continue to 2nd string, by slicing the initial buffer of XDR format
                var buf2 = buf.slice(len_xdr_1);

                var str2 = subject.fromXDR(buf2);

                auth_server = str2.toString();
                console.log('auth_server [%s]', auth_server);
            }

            if (auth_token && auth_server) {
                console.log("Credentials parsed succesfully");
                return true;
            } else {
                console.log("Parsing auth_token & auth_server failed");
                return false;
            }
        }
    } catch (error) {
        console.log(error.statusCode, error.body);
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

    var path = `/SensorCloud/devices/${device_id}/sensors/?version=1&auth_token=${auth_token}`;
    var url = 'https://' + auth_server + path;

    const req_options = {
        method: 'GET',
        headers: {
            'Accept': 'application/xdr',
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json',
        },
        // method: 'GET',
        // mode: 'navigate', // no-cors, cors, *same-origin
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit
        // headers: {
        //     'Accept': 'application/xdr',
        //     // 'Accept': 'application/json',
        // },
        // redirect: 'follow', // manual, *follow, error
        // referrer: 'no-referrer', // no-referrer, *client
        // body: JSON.stringify(data), // body data type must match "Content-Type" header
    }

    fetch(url, req_options)
        .then(function (response) {
            // console.log(response);
            return response.arrayBuffer();
            // return response.text();
        })
        .then(function (data) {
            // ���3occb378c1e8fbd48507c807f65ece9bfa7468bcba090d2fdb69�����dsx.sensorcloud.microstrain.com�����
            // console.log(data);
            // var len = data.byteLength;
            // // console.log(data.toString(16));
            // var view1 = new DataView(data);
            // // console.log(view1.getInt32(0).toString(16));
            // var arr = [];
            // for (var i = 0; i < len; i++) {
            //     var el = view1.getUint8(i).toString(16);
            //     // var el = view1.getUint8(i);
            //     // console.log(el);
            //     arr[i] = el;
            // }
            // console.log(arr.join(" "));

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

            // var constructedData = [].concat(arr);
            // var sig = xdr.Signature.fromXDR(constructedData);

            // console.log(sig);
            // console.log(Object.entries(sig));
            // // console.log(sig._attributes['ch_desc'].toString());
            // var jsonStr = JSON.stringify(sig);
            // console.log(jsonStr);
            // console.log(JSON.parse(jsonStr));

            // var keys = Object.keys(sig._attributes);
            // console.log(keys.length, keys);
            // for (var i = 0; i < keys.length; i++) {
            //     var val = keys[i];
            //     console.log(sig._attributes[val].toString())
            // }

            // var myObj = sig;

            if (sig._attributes.hasOwnProperty('version')) {
                console.log("\x1b[32mVERSION\x1b[0m version=[\x1b[32m%d\x1b[0m]", sig._attributes.version.toString());
                // console.log('\x1b[33m%s\x1b[0m', sig._attributes.version.toString());  //yellow
            }
            if (sig._attributes.hasOwnProperty('sensors')) {
                var objSensor = sig._attributes.sensors;
                for (var i in objSensor) {

                    // var objSensor = sig._attributes.sensors[i];
                    console.log('\x1b[32mSENSOR\x1b[0m name=[\x1b[32m%s\x1b[0m]] type=[\x1b[32m%s\x1b[0m]] label=[\x1b[32m%s\x1b[0m]] desc=[\x1b[32m%s\x1b[0m]]',
                        objSensor[i]._attributes.name.toString(),
                        objSensor[i]._attributes.type.toString(),
                        objSensor[i]._attributes.label.toString(),
                        objSensor[i]._attributes.desc.toString()
                    );

                    if (objSensor[i]._attributes.hasOwnProperty('channels')) {
                        var objChannel = objSensor[i]._attributes.channels;
                        for (var j in objChannel) {
                            // var objChannel = objSensor._attributes.channels[i];
                            console.log('\tCHANNEL name=[%s] label=[%s] desc=[%s]',
                                objChannel[j]._attributes.name.toString(),
                                objChannel[j]._attributes.label.toString(),
                                objChannel[j]._attributes.desc.toString()
                            );

                            if (objChannel[j]._attributes.hasOwnProperty('streams')) {
                                var objStream = objChannel[j]._attributes.streams;
                                for (var k in objStream) {
                                    // var objStream = objChannel._attributes.streams[i];
                                    console.log('\t\tSTREAM stream_type=[%s] total_bytes=[%d]',
                                        objStream[k]._attributes.stream_type.toString(),
                                        objStream[k]._attributes.total_bytes,
                                    );

                                    if (objStream[k]._attributes.hasOwnProperty('units')) {
                                        var objUnit = objStream[k]._attributes.units;
                                        for (var l in objUnit) {
                                            // var objUnit = objStream._attributes.units[i];
                                            console.log('\t\t\t\x1b[32mUNIT\x1b[0m stored_unit=[\x1b[32m%s\x1b[0m] preferred_unit=[\x1b[32m%s\x1b[0m] unit_timestamp=[\x1b[32m%d\x1b[0m] slope=[\x1b[32m%f\x1b[0m] offset=[\x1b[32m%f\x1b[0m]',
                                                objUnit[l]._attributes.stored_unit.toString(),
                                                objUnit[l]._attributes.preferred_unit.toString(),
                                                objUnit[l]._attributes.unit_timestamp.toString(),
                                                objUnit[l]._attributes.slope,
                                                objUnit[l]._attributes.offset,
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        });
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

