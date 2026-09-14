import * as dgram from "dgram";

const server = dgram.createSocket("udp4");

const PORT = 5606;
const GRAVITY = 9.80665;

function normalizePedal(value) {
  return value / 255;
}

function msToKmh(speed) {
  return speed * 3.6;
}

server.on("message", (buffer) => {
  if (buffer.length < 556) {
    return;
  }

  const packetType = buffer.readUInt8(10);

  if (packetType !== 0) {
    return;
  }

  const rpm = buffer.readUInt16LE(40);

  if (rpm <= 0) {
    return;
  }

  const speedMs = buffer.readFloatLE(36);
  const engineSpeed = buffer.readFloatLE(360);
  const engineTorque = buffer.readFloatLE(364);

  const accelerationX = buffer.readFloatLE(100);
  const accelerationY = buffer.readFloatLE(104);
  const accelerationZ = buffer.readFloatLE(108);

  const brake = normalizePedal(buffer.readUInt8(29));
  const throttle = normalizePedal(buffer.readUInt8(30));

  const speedKmh = msToKmh(speedMs);

  const lateralG = accelerationX / GRAVITY;
  const longitudinalG = accelerationZ / GRAVITY;

  const powerWatts = engineTorque * engineSpeed;
  const powerKw = powerWatts / 1000;
  const powerHp = powerWatts / 745.7;

  console.log(
    [
      `[TelemetryV8]`,
      `${speedKmh.toFixed(1)} km/h`,
      `${rpm} RPM`,
      `Throttle ${(throttle * 100).toFixed(0)}%`,
      `Brake ${(brake * 100).toFixed(0)}%`,
      `${engineTorque.toFixed(1)} Nm`,
      `${powerHp.toFixed(1)} hp`,
      `${powerKw.toFixed(1)} kW`,
      `Lat ${lateralG.toFixed(2)} G`,
      `Long ${longitudinalG.toFixed(2)} G`,
    ].join(" | "),
  );
});

server.bind(PORT, () => {
  console.log(
    `TelemetryV8 escutando a telemetria do AMS2 na porta ${PORT}...`,
  );
});