let port;
let reader;
let temperatureValue = 0;
let humidityValue = 0;
let soilHumidityValue = 0;

function updateValues() {
  // Actualiza los valores en los círculos
  document.querySelectorAll('.circle').forEach((circle, index) => {
    switch (index) {
      case 0:
        circle.textContent = temperatureValue;
        break;
      case 1:
        circle.textContent = humidityValue;
        break;
      case 2:
        circle.textContent = soilHumidityValue;
        break;
    }
  });

  // Actualiza los gráficos
  document.querySelectorAll('.graph').forEach((graph, index) => {
    const bar = graph.querySelector('.bar');
    switch (index) {
      case 0:
        bar.style.width = `${(temperatureValue / 36) * 100}%`;
        break;
      case 1:
        bar.style.width = `${(humidityValue / 100) * 100}%`;
        break;
      case 2:
        bar.style.width = `${(soilHumidityValue / 100) * 100}%`;
        break;
    }
  });
}

function updateSensorData(data) {
  const tempMatch = data.match(/Temperature:([\d.]+)/);
  const humMatch = data.match(/Humidity:([\d.]+)/);
  const soilMatch = data.match(/SoilMoisture:(\d+)/);

  if (tempMatch) {
    temperatureValue = parseFloat(tempMatch[1]);
  }
  if (humMatch) {
    humidityValue = parseFloat(humMatch[1]);
  }
  if (soilMatch) {
    soilHumidityValue = parseInt(soilMatch[1]);
  }

  updateValues();
}

document.getElementById('connectButton').addEventListener('click', async () => {
  if ('serial' in navigator) {
    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      reader = textDecoder.readable.getReader();

      readLoop();
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo conectar al Arduino. Verifica que esté conectado correctamente.');
    }
  } else {
    alert('Web Serial API no es compatible con este navegador.');
  }
});

async function readLoop() {
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      reader.releaseLock();
      break;
    }
    updateSensorData(value);
  }
}