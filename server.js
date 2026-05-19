import * as dgram from 'dgram';

const server = dgram.createSocket('udp4');
const PORT = 5606;

server.on('message', (msgBuffer, rinfo) => {
  const packetType = msgBuffer.readUInt8(10);

  if (packetType === 0) {
    
    const rpm = msgBuffer.readUInt16LE(40);
    
    const aceleradorBruto = msgBuffer.readUInt8(30);
    const acelerador = Math.round((aceleradorBruto / 255) * 100); 

    const velocidadeMS = msgBuffer.readFloatLE(36);
    const velocidadeKMH = Math.round(velocidadeMS * 3.6);

    if (rpm > 0) {
      console.log(`[ECU V8] Velocidade: ${velocidadeKMH} km/h | RPM: ${rpm} | Acelerador: ${acelerador}% | Freio: ${freio}%`);
    }
  }
});

server.bind(PORT, () => {
  console.log(`V8 ECU escutando a telemetria do AMS2 na porta ${PORT}...`);
});