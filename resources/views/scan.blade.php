<!DOCTYPE html>
<html>
<head>
  <title>Live Scan Viewer</title>
  <meta charset="UTF-8" />
  <script>
    async function pollScan() {
      try {
        const res = await fetch("http://192.168.0.10:8000/api/access/latest");
        const data = await res.json();
        if (data && data.code) {
          document.getElementById("output").innerText =
            "CODE: " + data.code + "\nDEVICE: " + data.device + "\nTIME: " + data.timestamp;
        }
      } catch (e) {
        console.error("Error fetching scan", e);
      }
    }

    setInterval(pollScan, 1000); // Poll every 1 second
  </script>
</head>
<body>
  <h1>🧾 Live Scan Viewer</h1>
  <pre id="output">Waiting for scan...</pre>
</body>
</html>
