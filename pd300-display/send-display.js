const { SerialPort } = require('serialport');
const { autoDetect } = require('@serialport/bindings-cpp');

const bindings = autoDetect();

const line1 = process.argv[2] || '';
const line2 = process.argv[3] || '';

const clearDisplay = '\x0C'; // clear command
const maxLength = 20;

const clean = (text) => {
  return text.replace(/[^\x20-\x7E]/g, '').padEnd(maxLength).slice(0, maxLength);
};

const message = clearDisplay + clean(line1) + clean(line2);

bindings.list().then(ports => {
  const tryNext = (index) => {
    if (index >= ports.length) {
      console.error('PD-300 not found or no ports worked.');
      return;
    }

    const portPath = ports[index].path;
    console.log(`Trying port: ${portPath}`);

    const port = new SerialPort({ path: portPath, baudRate: 9600 }, (err) => {
      if (err) {
        console.error(`Error opening ${portPath}:`, err.message);
        return tryNext(index + 1);
      }

      const buffer = Buffer.from(message, 'ascii');

      port.write(buffer, (err) => {
        if (err) {
          console.error(`Write failed on ${portPath}:`, err.message);
          port.close();
          return tryNext(index + 1);
        } else {
          console.log(`Message sent successfully on ${portPath}`);
          port.close();
        }
      });
    });
  };

  tryNext(0);
}).catch(err => {
  console.error('Failed to list ports:', err);
});
