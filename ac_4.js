'use strict';

const Protocol = require('azure-iot-device-mqtt').Mqtt;

const Client = require('azure-iot-device').Client;
let client = null;


function main() {
  // open a connection to the device
  const deviceConnectionString = "<AC-CONTROLLER-CONNECTION-STRING>";
  
  client = Client.fromConnectionString(deviceConnectionString, Protocol);
  client.open(onConnect);
}

function onConnect(err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Connected to device. Registering handlers for methods.');
    client.onDeviceMethod('power', onDirectMethodInvocation);
    client.onDeviceMethod('temp', onDirectMethodInvocation);
  }
}

function onDirectMethodInvocation(request, response) {
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
