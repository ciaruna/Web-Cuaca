// script.js

// 1. Definisikan API Key dan URL Base OpenWeatherMap Anda di sini
// API Key Anda sudah dimasukkan secara langsung di sini.
const OPENWEATHER_API_KEY = '7fca119dc367a6189ecefc7a38844383';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// 2. Menggunakan Class untuk merepresentasikan Weather Service
class WeatherService {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    /**
     * Mengambil data cuaca untuk kota tertentu.
     * @param {string} city - Nama kota.
     * @returns {Promise<Object>} Promise yang berisi objek data cuaca.
     */
    async getWeatherByCity(city) {
        if (!city) {
            throw new Error("Nama kota tidak boleh kosong.");
        }
        const url = `${this.baseUrl}?q=${city}&appid=${this.apiKey}&units=metric&lang=id`;
        // units=metric untuk suhu dalam Celsius
        // lang=id untuk deskripsi cuaca dalam Bahasa Indonesia (jika tersedia)

        try {
            console.log(`Mengambil data cuaca untuk: ${city} dari ${url}`);
            const response = await fetch(url);

            if (!response.ok) {
                // Menangani error seperti kota tidak ditemukan (status 404)
                if (response.status === 404) {
                    throw new Error(`Kota "${city}" tidak ditemukan. Mohon periksa ejaan.`);
                }
                throw new Error(`Terjadi masalah saat mengambil data cuaca: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Data cuaca berhasil diambil:", data);
            return data;
        } catch (error) {
            console.error("Kesalahan saat mengambil data cuaca:", error);
            throw error; // Melemparkan error agar bisa ditangkap oleh pemanggil
        }
    }
}

// 3. Menggunakan Function untuk menampilkan data cuaca di UI
function displayWeatherInUI(weatherData, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Bersihkan container sebelumnya

    if (!weatherData || !weatherData.main || !weatherData.weather || weatherData.weather.length === 0) {
        container.innerHTML = '<p class="error-message">Data cuaca tidak lengkap atau tidak tersedia.</p>';
        return;
    }

    const { name, main, weather, wind } = weatherData;
    const temperature = main.temp;
    const feelsLike = main.feels_like;
    const humidity = main.humidity;
    const description = weather[0].description;
    const iconCode = weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    const windSpeed = wind.speed; // Kecepatan angin dalam meter/detik jika units=metric

    const weatherHtml = `
        <div class="weather-info">
            <h2>Cuaca di ${name}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <p>Suhu: <strong>${temperature}°C</strong> (Terasa seperti: ${feelsLike}°C)</p>
            <p>Kondisi: ${description.charAt(0).toUpperCase() + description.slice(1)}</p>
            <p>Kelembaban: ${humidity}%</p>
            <p>Kecepatan Angin: ${windSpeed} m/s</p>
        </div>
    `;
    container.innerHTML = weatherHtml;
}

// 4. Fungsi untuk menampilkan pesan error di UI
function displayErrorMessage(message, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p class="error-message">${message}</p>`;
}

// 5. Fungsi utama untuk menjalankan aplikasi cuaca
async function runAppWeather() {
    const cityInput = document.getElementById('cityInput');
    const cityName = cityInput.value.trim(); // Ambil nilai input dan hapus spasi di awal/akhir

    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.innerHTML = '<p>Memuat data cuaca...</p>'; // Pesan loading

    if (!cityName) {
        displayErrorMessage("Mohon masukkan nama kota.", 'weather-container');
        return;
    }

    // Inisialisasi WeatherService
    const weatherService = new WeatherService(OPENWEATHER_API_KEY, OPENWEATHER_BASE_URL);

    try {
        const fetchedWeatherData = await weatherService.getWeatherByCity(cityName);

        // Tampilkan data di console.log (lebih informatif untuk objek cuaca)
        if (fetchedWeatherData) {
            console.log("\n--- Data Cuaca di Console ---");
            console.log(fetchedWeatherData);
        }

        // Tampilkan data di UI
        displayWeatherInUI(fetchedWeatherData, 'weather-container');
    } catch (error) {
        // Tangani error yang dilemparkan dari WeatherService
        displayErrorMessage(`Gagal mengambil data cuaca: ${error.message}`, 'weather-container');
    }
}

// 6. Menambahkan event listener ke tombol "Lihat Cuaca"
document.getElementById('getWeatherButton').addEventListener('click', runAppWeather);

// Menambahkan event listener untuk menekan 'Enter' di input
document.getElementById('cityInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Mencegah form submit default
        document.getElementById('getWeatherButton').click(); // Simulasikan klik tombol
    }
});

// Opsional: Muat cuaca untuk kota default saat halaman pertama kali dibuka
// window.onload = () => {
//     document.getElementById('cityInput').value = 'Jakarta'; // Contoh kota default
//     runAppWeather();
// };