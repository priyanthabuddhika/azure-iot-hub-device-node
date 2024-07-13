'use strict';

const Protocol = require('azure-iot-device-mqtt').Mqtt;

const Message = require('azure-iot-device').Message;
const Client = require('azure-iot-device').Client;
let client = null;
let powerState = null;

function main() {
  // open a connection to the device
  const deviceConnectionString = "<SMART-PLUG-CONNECTION-STRING>";
  client = Client.fromConnectionString(deviceConnectionString, Protocol);
  client.open(onConnect);

  setInterval(() => {
    if (powerState === 'ON') {
      const date = new Date();
      const data = JSON.stringify({
        "Time": date,
        "ENERGY": {
          "TotalStartTime": date,
          "Total": 0.001,
          "Yesterday": 0,
          "Today": 0.001,
          "Period": 0,
          "Power": Number.parseFloat((Math.random() * (100 - 75 + 1)) + 75).toFixed(2),
          "ApparentPower": 12,
          "ReactivePower": 11,
          "Factor": 0.48,
          "Voltage": Number.parseFloat((Math.random() * (250 - 210 + 1)) + 210).toFixed(2),
          "Current": Number.parseFloat((Math.random() * (15 - 1 + 1)) + 1).toFixed(2)
        }
      }
      );

      sendTelemetry(client, data, 1).catch((err) => console.log('error ', err.toString()));
    }
  }, 60000);
}

function onConnect(err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Connected to device. Registering handlers for methods.');
    setInitialPowerState();
    client.onDeviceMethod('power', onDirectMethodInvocation);
  }
}

async function sendTelemetry(deviceClient, data, index) {
  console.log('Sending telemetry message %d', index);

  const msg = new Message(data);
  msg.contentType = 'application/json';
  msg.contentEncoding = 'utf-8';

  await deviceClient.sendEvent(msg);
}

function onDirectMethodInvocation(request, response) {
  printDeviceMethodRequest(request);

  response.send(200, '', function (err) {
    if (err) {
      console.error('An error ocurred when sending a method response:\n' +
        err.toString());
    } else {
      if (request.methodName === 'power' && request.payload.state) {
        powerState = request.payload.state;
      }

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

function setInitialPowerState() {
  client.getTwin((twinErr, twin) => {
    if (twinErr) {
      console.error('Could not get twin: ' + twinErr.message);
    } else {
      powerState = twin.properties.desired.POWER;
    }
  });
}

main();
