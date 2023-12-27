'use strict';

const Protocol = require('azure-iot-device-mqtt').Mqtt;

const Message = require('azure-iot-device').Message;
const Client = require('azure-iot-device').Client;
let client = null;

function main() {
  // open a connection to the device
  const deviceConnectionString = "<DEVICE-CONNECTION-STRING>";
  client = Client.fromConnectionString(deviceConnectionString, Protocol);
  client.open(onConnect);

  setInterval(() => {
    const date = new Date();
    const data = JSON.stringify({
      "deviceId": "<DEVICE-ID>",
      "time_stamp": date,
      "power": Number.parseFloat((Math.random() * (50 - 30 + 1)) + 30).toFixed(2).toString(),
      "voltage": Number.parseFloat((Math.random() * (250 - 210 + 1)) + 210).toFixed(2).toString(),
      "current": Number.parseFloat((Math.random() * (15 - 1 + 1)) + 1).toFixed(2).toString(),
      "kva": Number.parseFloat((Math.random() * (50 - 30 + 1)) + 30).toFixed(2).toString(),
      "state": "ON"
    }
    );
    
    sendTelemetry(client, data, 1).catch((err) => console.log('error ', err.toString()));
  }, 60000);
}

function onConnect(err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Connected to device. Registering handlers for methods.');
    client.onDeviceMethod('power', onSwitchPower);
  }
}

async function sendTelemetry(deviceClient, data, index) {
  console.log('Sending telemetry message %d', index);

  const msg = new Message(data);
  msg.contentType = 'application/json';
  msg.contentEncoding = 'utf-8';

  await deviceClient.sendEvent(msg);
}

function onSwitchPower(request, response) {
  printDeviceMethodRequest(request);

  response.send(200, '', function (err) {
    if (err) {
      console.error('An error ocurred when sending a method response:\n' +
        err.toString());
    } else {
      console.log('Response to method \'' + request.methodName +
        '\' sent successfully.');
    }
  });
}

function printDeviceMethodRequest(request) {
  console.log('Received method call for method \'' + request.methodName + '\'');

  if (request.payload) {
    console.log('\nPayload:\n');
    console.log(request.payload);
  }
}

main();
