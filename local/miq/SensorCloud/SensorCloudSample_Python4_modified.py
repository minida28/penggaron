

import http.client
import xdrlib
import time
import math
import json
import pprint

AUTH_SERVER = "sensorcloud.microstrain.com"

# samplerate types
HERTZ = 1
SECONDS = 0

dataXdr = ""

def authenticate_key(device_id, key):
    """
    authenticate with sensorcloud and get the server and auth_key for all subsequent api requests
    """
    conn = http.client.HTTPSConnection(AUTH_SERVER)

    headers = {"Accept": "application/xdr"}
    url = "/SensorCloud/devices/%s/authenticate/?version=1&key=%s" % (
        device_id, key)

    print("authenticating...")
    conn.request('GET', url=url, headers=headers)
    response = conn.getresponse()
    print(response.status, response.reason)
    # if response is 200 ok then we can parse the response to get the auth token and server
    if response.status is 200:
        print("Credential are correct")

        # read the body of the response
        data = response.read()

        # response will be in xdr format. Create an XDR unpacker and extract the token and server as strings
        unpacker = xdrlib.Unpacker(data)
        auth_token = unpacker.unpack_string().decode('utf-8')
        server = unpacker.unpack_string().decode('utf-8')

        print("unpacked xdr.  server:%s  token:%s" % (server, auth_token))

        return server, auth_token


def authenticate_alternate(device_id, username, password):
    """
    authenticate with sensorcloud and get the server and auth_key for all subsequent api requests
    """
    conn = http.client.HTTPSConnection(AUTH_SERVER)

    headers = {"Accept": "application/xdr"}
    url = "/SensorCloud/devices/%s/authenticate/?version=1&username=%s&password=%s" % (
        device_id, username, password)

    print("authenticating...")
    conn.request('GET', url=url, headers=headers)
    response = conn.getresponse()
    print(response.status, response.reason)

    # if response is 200 ok then we can parse the response to get the auth token and server
    if response.status is http.client.OK:
        print("Credential are correct")

        # read the body of the response
        data = response.read()

        # response will be in xdr format. Create an XDR unpacker and extract the token and server as strings
        unpacker = xdrlib.Unpacker(data)
        auth_token = unpacker.unpack_string().decode('utf-8')
        server = unpacker.unpack_string().decode('utf-8')

        print("unpacked xdr.  server:%s  token:%s" % (server, auth_token))

        return server, auth_token


def addSensor(server, auth_token, device_id, sensor_name, sensor_type="", sensor_label="", sensor_desc=""):
    """
    Add a sensor to the device. type, label, and description are optional.
    """

    conn = http.client.HTTPSConnection(server)

    url = "/SensorCloud/devices/%s/sensors/%s/?version=1&auth_token=%s" % (
        device_id, sensor_name, auth_token)

    headers = {"Content-type": "application/xdr"}

    # addSensor allows you to set the sensor type label and description.  All fileds are strings.
    # we need to pack these strings into an xdr structure
    packer = xdrlib.Packer()
    packer.pack_int(1)  # version 1
    packer.pack_string(sensor_type.encode('utf-8'))
    packer.pack_string(sensor_label.encode('utf-8'))
    packer.pack_string(sensor_desc.encode('utf-8'))
    data = packer.get_buffer()

    print("adding sensor...")
    conn.request('PUT', url=url, body=data, headers=headers)
    response = conn.getresponse()
    print(response.status, response.reason)

    # if response is 201 created then we know the sensor was added
    if response.status is 201:
        print("Sensor added")
    else:
        print("Error adding sensor. Error:", response.read())


def deleteSensor(server, auth_token, device_id, sensor_name):
    """
    Delete a sensor.
    """

    conn = http.client.HTTPSConnection(server)

    url = "/SensorCloud/devices/%s/sensors/%s/?version=1&auth_token=%s" % (
        device_id, sensor_name, auth_token)

    print("Deleting sensor...")
    conn.request('DELETE', url=url)
    response = conn.getresponse()
    print(response.status, response.reason)

    # if response is 204 deleted then we know the sensor was deleted
    if response.status is 204:
        print("Sensor deleted")
    else:
        print("Error deleting sensor. Error:", response.read())


def addChannel(server, auth_token, device_id, sensor_name, channel_name, channel_label="", channel_desc=""):
    """
    Add a channel to the sensor.  label and description are optional.
    """

    conn = http.client.HTTPSConnection(server)

    url = "/SensorCloud/devices/%s/sensors/%s/channels/%s/?version=1&auth_token=%s" % (
        device_id, sensor_name, channel_name, auth_token)

    headers = {"Content-type": "application/xdr"}

    # addChannel allows you to set the channel label and description.  All fileds are strings.
    # we need to pack these strings into an xdr structure
    packer = xdrlib.Packer()
    packer.pack_int(1)  # version 1
    packer.pack_string(channel_label.encode('utf-8'))
    packer.pack_string(channel_desc.encode('utf-8'))
    data = packer.get_buffer()

    print("adding channel...")
    conn.request('PUT', url=url, body=data, headers=headers)
    response = conn.getresponse()
    print(response.status, response.reason)

    # if response is 201 created then we know the channel was added
    if response.status is 201:
        print("Channel successfuly added")
    else:
        print("Error adding channel.  Error:", response.read())


def deleteChannel(server, auth_token, device_id, sensor_name, channel_name):
    """
    Delete a channel of a sensor.
    """

    conn = http.client.HTTPSConnection(server)

    url = "/SensorCloud/devices/%s/sensors/%s/channels/%s/?version=1&auth_token=%s" % (
        device_id, sensor_name, channel_name, auth_token)

    print("Deleting channel...")
    conn.request('DELETE', url=url)
    response = conn.getresponse()
    print(response.status, response.reason)

    # if response is 204 deleted then we know the channel was added
    if response.status is 204:
        print("Channel successfuly deleted")
    else:
        print("Error deleting channel.  Error:", response.read())


def GeneratingData():
    # we need to pack these strings into an xdr structure
    packer = xdrlib.Packer()
    packer.pack_int(1)  # version 1

    # set samplerate to 10 Hz
    packer.pack_enum(HERTZ)
    packer.pack_int(10)

    # Total number of datapoints.  6000 points is 10 minutes of data sampled at 10 Hz
    POINTS = 1000
    packer.pack_int(POINTS)

    print("generating data...")
    # now pack each datapoint, we'll use a sin wave function to generate fake data.  we'll use the current time as the starting point
    # start time in nanoseconds
    timestamp_nanoseconds = int(time.time()*1000000000)
    # number of nanoseconds between 2 datapoints when sampling at 10 Hz
    sampleInterval_nanoseconds = 100000000
    for i in range(0, POINTS):
        packer.pack_hyper(timestamp_nanoseconds)
        # generate value as a function of time
        packer.pack_float(math.sin(timestamp_nanoseconds/20000000000.0))

        # increment the timestamp for the next datapoint
        timestamp_nanoseconds += sampleInterval_nanoseconds

        # print(timestamp_nanoseconds, math.sin(timestamp_nanoseconds/20000000000.0))

    return packer.get_buffer()


def uploadSinWave(server, auth_token, device_id, sensor_name, channel_name):
    """
    Upload 10 minutes of 10 hz sin wave data.  use time.now() as the starting timestamp
    """

    print("adding data...")
    conn = http.client.HTTPSConnection(server)
    url = "/SensorCloud/devices/%s/sensors/%s/channels/%s/streams/timeseries/data/?version=1&auth_token=%s" % (
        device_id, sensor_name, channel_name, auth_token)   
    headers = {"Content-type": "application/xdr"}
    conn.request('POST', url=url, body=dataXdr, headers=headers)
    response = conn.getresponse()
    print(response.status, response.reason)

    # if response is 201 created then we know the data was added
    if response.status is 201:
        print("data successfuly added")
    else:
        print("Error adding data.  Error:", response.read())


def downloadData(server, auth_token, device_id, sensor_name, channel_name, startTime, endTime):
    """
    download the 10 minutes of data uploaded by uploadSinWave.
    Returns an array of tuples, where each tuple is a timestamp and a value
    """
    conn = http.client.HTTPSConnection(server)

    url = "/SensorCloud/devices/%s/sensors/%s/channels/%s/streams/timeseries/data/?version=1&auth_token=%s&starttime=%s&endtime=%s" % (
        device_id, sensor_name, channel_name, auth_token, startTime, endTime)
    headers = {"Accept": "application/xdr"}
    print("Downloading data...")
    conn.request("GET", url=url, headers=headers)
    response = conn.getresponse()
    data = []
    print(response.status, response.reason)
    if response.status is 200:
        print("Data retrieved")
        unpacker = xdrlib.Unpacker(response.read())
        while True:
            try:
                timestamp = unpacker.unpack_uhyper()
                value = unpacker.unpack_float()
                data.append((timestamp, value))
            except Exception as e:
                print(e)
                break
        return data
    else:
        print("Status: %s" % response.status)
        print("Reason: %s" % response.reason)
        return data


def GetSensors(server, auth_token, device_id):
    """
    Download the Sensors and Channel information for the Device.
    Packs into a dict for easy con
    """
    conn = http.client.HTTPSConnection(server)

    url = "/SensorCloud/devices/%s/sensors/?version=1&auth_token=%s" % (
        device_id, auth_token)
    headers = {"Accept": "application/xdr"}
    print("Get sensor data...")
    conn.request("GET", url=url, headers=headers)
    sensors = {}
    response = conn.getresponse()
    print(response.status, response.reason)
    # print(response.read())
    if response.status is 200:
        
        print("Sensor data Retrieved")
        xdrdata = response.read()
        print(len(xdrdata))
        unpacker = xdrlib.Unpacker(xdrdata)
        # print(len(unpacker.get_buffer))
        # unpack version, always first
        unpacker.unpack_int()
        # sensor info is an array of sensor structs. In XDR, first you read an int, and that's the number of items in the array.  You can then loop over the number of elements in the array
        numSensors = unpacker.unpack_int()
        print("Number of items in the array:", numSensors)
        for i in range(numSensors):
            print("numSensors")
            sensorName = unpacker.unpack_string().decode('utf-8')
            sensorType = unpacker.unpack_string().decode('utf-8')
            sensorLabel = unpacker.unpack_string().decode('utf-8')
            sensorDescription = unpacker.unpack_string().decode('utf-8')
            # using sensorName as a key, add info to sensor dict
            sensors[sensorName] = {"name": sensorName, "type": sensorType,
                                   "label": sensorLabel, "description": sensorDescription, "channels": {}}
            # channels for each sensor is an array of channelInfo structs.  Read array length as int, then loop through the items
            numChannels = unpacker.unpack_int()
            for j in range(numChannels):
                print("numChannels")
                channelName = unpacker.unpack_string().decode('utf-8')
                channelLabel = unpacker.unpack_string().decode('utf-8')
                channelDescription = unpacker.unpack_string().decode('utf-8')
                # using channel name as a key, add info to sensor's channel dict
                sensors[sensorName]["channels"][channelName] = {
                    "name": channelName, "label": channelLabel, "description": channelDescription, "streams": {}}
                # dataStreams for each channel is an array of streamInfo structs, Read array length as int, then loop through the items
                numStreams = unpacker.unpack_int()
                for k in range(numStreams):
                    print("numStreams")
                    # streamInfo is a union, where the type indicates which stream struct to use.  Currently we only support timeseries version 1, so we'll just code for that
                    streamType = unpacker.unpack_string().decode('utf-8')
                    if streamType == "TS_V1":
                        print("streamType == TS_V1")
                        # TS_V1 means we have a timeseriesInfo struct
                        # total bytes allows us to jump ahead in our buffer if we're uninterested in the units.  For verbosity, we will parse them.
                        total_bytes = unpacker.unpack_int()
                        print("total_bytes", total_bytes)
                        # units for each data stream is an array of unit structs.  Read array length as int, then loop through the items
                        numUnits = unpacker.unpack_int()
                        # add TS_V1 to streams dict
                        sensors[sensorName]["channels"][channelName]["streams"]["TS_V1"] = {
                            "units": {}}
                        for l in range(numUnits):
                            print("numUnits")
                            storedUnit = unpacker.unpack_string().decode('utf-8')
                            preferredUnit = unpacker.unpack_string().decode('utf-8')
                            unitTimestamp = unpacker.unpack_uhyper()
                            slope = unpacker.unpack_float()
                            offset = unpacker.unpack_float()
                            # using unitTimestamp as a key, add unit info to unit dict
                            sensors[sensorName]["channels"][channelName]["streams"]["TS_V1"]["units"][str(unitTimestamp)] = {"stored": storedUnit,
                                                                                                                             "preferred": preferredUnit, "unitTimestamp": unitTimestamp, "slope": slope, "offset": offset}
    return sensors


if __name__ == "__main__":

    # info for API key authentication
    # device_id = "OAPI009ZGGUBW0CN"
    # key = "e087cb6ea7b36350f21986a0da2f3fbbbaf85f9fe4ebc67e1c0e68ba0e778a29"

    # orangsoroako@gmail.com 
    device_id = "OAPI00D4CMV2RPWF";
    key = "2d73ff3acdf9adf70a0c7641c5c6c2e9d185cba06cdb42d1ca6ace5273fdec2b";

    # info for alternate method of authentication using username/password
    # (Needs to be enabled by user under permissions for the device)
    username = "YOUR_LOGIN_NAME_HERE"
    password = "YOU_LOGIN_PASSWORD_HERE"

    # first autheticate using the open api device serial and it's coresponding key
    # autheticate will return the server and an auth_token for all subsequent reguests
    server, auth_token = authenticate_key(device_id, key)
    # alternate method, uncomment to use
    #server, auth_token = authenticate_alternate(device_id, username, password)

    sensors = GetSensors(server, auth_token, device_id)
    pprint.pprint(sensors)

    # delete a channel to the sensor
    if (0):
        deleteChannel(server, auth_token, device_id,
                      sensor_name="S1", channel_name="temp")

    if (0):
        deleteChannel(server, auth_token, device_id,
                      sensor_name="SG-502", channel_name="channel-2")

    # delete a new sensor to the device
    if (0):
        deleteSensor(server, auth_token, device_id, sensor_name="S1")

    # delete a new sensor to the device
    if (0):
        deleteSensor(server, auth_token, device_id, sensor_name="SG-502")

    # add a new sensor to the device
    if (0):
        addSensor(server, auth_token, device_id, sensor_name="S1",
                  sensor_desc="This is my first SensorCloud Sensor")

    # now add a channel to the sensor
    if (0):
        addChannel(server, auth_token, device_id,
                   sensor_name="S1", channel_name="temp")

    # generating data
    if (0):
        dataXdr = GeneratingData()

    # now add some data to the channel
    if (0):
        uploadSinWave(server, auth_token, device_id,
                      sensor_name="S1", channel_name="temp")

    # now download the channel data to an array
    # we need to specify range, roughly we can guess that the data is from a minute ago up to 20 minutes from now (it's 10 minutes worth of data in our data generator above)
    if (0):
        startTime = int(time.time()) - 60
        endTime = startTime + 1200  # 1200 = 20 minutes in seconds
        # call download function, the time ranges are in nanoseconds
        data = downloadData(server, auth_token, device_id, "S1",
                            "temp", startTime*1000000000, endTime*1000000000)

        if (data):
            print("Downloaded %s points" % len(data))
            print("First point %s" % str(data[0]))
            print("Last point %s" % str(data[-1]))
        else:
            print("No data is available")
