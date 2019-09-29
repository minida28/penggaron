const got = require('got');
var XDR = require('js-xdr');
// import { toJSON } from 'json-xdr';
// import { toXDR } from 'json-xdr';
// import * as XDR from '/home/miq/node_modules/js-xdr/src/index';

var AUTH_SERVER = "sensorcloud.microstrain.com";

var AUTH_DNS_SERVER;
var AUTH_TOKEN;

var device_id = "OAPI009ZGGUBW0CN";
var key = "e087cb6ea7b36350f21986a0da2f3fbbbaf85f9fe4ebc67e1c0e68ba0e778a29";
// # info for alternate method of authentication using username/password
// # (Needs to be enabled by user under permissions for the device)
var username = "your_username";
var password = "your_password";


var sensor_name = 'S1';
var channel_name = 'temp';

function GeneratingData() {

    // parameter
    var lordVersion = 1;
    var lordRateType = 1; // HERTZ
    var lordSampleRate = 1;
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

    constructedData = Buffer.concat(construct);

    console.log(constructedData);
    console.log('length', constructedData.toString('ascii').length);

    return constructedData;
}


// Use `authenticate_key` exactly how you use `got`
(async () => {   

    if (true) {
        var response;
        const url_options = {
            hostname: AUTH_SERVER,
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
            console.log('\r\n------------------------------ Authenticating ------------------------------');

            const authenticate_key = got(url_options, req_options);

            response = await authenticate_key;

        } catch (error) {
            console.log(error.code, error.name);
        }

        console.log(response.statusCode, response.statusMessage);

        if (response.statusCode == 200) {
            var acceptResponseHeader = req_options.headers['accept'] // application/json or application/xdr
            console.log('GET accept header:', acceptResponseHeader);
            if (acceptResponseHeader === 'application/json') {
                var credential = JSON.parse(response.body);
                AUTH_TOKEN = credential.auth_token;
                AUTH_DNS_SERVER = credential.server;
                console.log('AUTH_TOKEN\t:', AUTH_TOKEN);
                console.log('AUTH_DNS_SERVER\t\t:', AUTH_DNS_SERVER);
            } else if (acceptResponseHeader === 'application/xdr') {
                // var buffer = Buffer.from(response.body);
                var data = response.body;
                console.log(data);
                var buf = Buffer.from(data);
                console.log('buf', buf);
                var splitArr = data.toString();
                console.log(splitArr);
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
                console.log('AUTH_TOKEN', str.length, str.toString());

                AUTH_TOKEN = str.toString();

                // get how many actual bytes consumed by 1st string
                // but the string has to be returned back to XDR format 
                var temp = subject.toXDR(str.toString());

                // then get the actual lenght of the 1st string in XDR format
                var len_xdr_1 = Buffer.byteLength(temp);

                // continue to 2nd string, by slicing the initial buffer of XDR format
                var buf2 = buf.slice(len_xdr_1);

                var str2 = subject.fromXDR(buf2);
                console.log('AUTH_DNS_SERVER', str2.length, str2.toString());

                AUTH_DNS_SERVER = str2.toString();
            }
        }

        if (response.statusCode == 200 && response.statusMessage === 'OK') {

            console.log('\r\n------------------------------ Generating data ------------------------------');

            var sampleData = GeneratingData();

            try {
                console.log('\r\n------------------------------- Sending data -------------------------------');

                var sensor_name = 'S1';
                var channel_name = 'temp';

                const url_options = {
                    hostname: AUTH_DNS_SERVER,
                    // port: 443, // default to HTTPS, see: https://nodejs.org/api/https.html#https_https_request_options_callback
                    path: `/SensorCloud/devices/${device_id}/sensors/${sensor_name}/channels/${channel_name}/streams/timeseries/data/?version=1&auth_token=${AUTH_TOKEN}`,
                    method: 'POST'
                };

                const req_options = {
                    headers: {
                        "Content-Type": "application/xdr",
                    },
                    timeout: 20000,
                    body: sampleData
                }

                const uploadSinWave = got.post(url_options, req_options);
                const response = await uploadSinWave;
                // console.log(response);
                console.log(response.statusCode, response.statusMessage);
            } catch (error) {
                // console.error(error.body);
                // console.log(error);
                console.log(error.statusCode, error.body);
            }
        }
    }

})();