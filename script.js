document.addEventListener("DOMContentLoaded", function () {
    let map = L.map('map').setView([-7.8014, 110.3646], 10); // Default ke Yogyakarta

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker = L.marker([-7.8014, 110.3646]).addTo(map);

    document.getElementById("checkButton").addEventListener("click", async function () {
        let heritageSelect = document.getElementById("heritageSelect");
        let selectedLocation = heritageSelect.value.split(",");
        let lat = parseFloat(selectedLocation[0]);
        let lon = parseFloat(selectedLocation[1]);

        // Update peta dan marker
        map.setView([lat, lon], 12);
        marker.setLatLng([lat, lon]);

        // Cek kondisi cuaca dan gempa
        await checkHeritageWeather(lat, lon);
        await checkHeritageEarthquake(lat, lon);
    });
});
async function checkHeritageWeather(lat, lon) {
    try {
        let apiKey = "fb4652173ecf6ddaa723b12cf20e0e9a";
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        let data = await response.json();

        let suhu = data.main.temp;
        let kelembaban = data.main.humidity;
        let kondisi = data.weather[0].description;

        document.getElementById("weatherInfo").innerHTML = `
            🌡 Suhu: ${suhu}°C<br>
            💧 Kelembaban: ${kelembaban}%<br>
            ☁ Kondisi: ${kondisi}
        `;

        let alertBox = document.getElementById("alertBox");
        if (suhu > 35 || kelembaban < 20) {
            alertBox.innerHTML = "⚠ Status: Bahaya! Suhu tinggi atau kelembaban rendah.";
            alertBox.style.background = "#c00";
        } else {
            alertBox.innerHTML = "✅ Status: Aman";
            alertBox.style.background = "#0c0";
        }
    } catch (error) {
        console.error("Gagal mengambil data cuaca:", error);
    }
}

async function checkHeritageEarthquake(lat, lon) {
    try {
        let response = await fetch("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=5");
        let data = await response.json();

        let gempaTerdekat = data.features.find(gempa => {
            let gempaLat = gempa.geometry.coordinates[1];
            let gempaLon = gempa.geometry.coordinates[0];
            let jarak = Math.sqrt((gempaLat - lat) ** 2 + (gempaLon - lon) ** 2);
            return jarak < 1.0; // Radius ~100km
        });
 if (gempaTerdekat) {
            document.getElementById("alertBox").innerHTML = "⚠ Status: Bahaya! Ada gempa terdekat.";
            document.getElementById("alertBox").style.background = "#c00";
        }
    } catch (error) {
        console.error("Gagal mengambil data gempa:", error);
    }
}