# Silkworm Farm IoT Dashboard & Mobile App

A sophisticated IoT monitoring and control system designed for automated silkworm farming. This project bridges a physical ESP32-based sensor array with a high-performance React dashboard and a native Android application.

## 🚀 Key Features

- **Real-time IoT Monitoring**: Live telemetry for Temperature, Humidity, Light (LDR), Gas (MQ), and Fire sensors via ESP32.
- **Actuator Control**: Remote manual control for Feeding Motors and Cooling Fans directly from the app.
- **Critical Alerts**: Intelligent notification system with specialized "Tray Status" detection for silkworm health monitoring.
- **Cross-Platform**: Built as a responsive web dashboard and converted into a native Android APK using Capacitor.
- **Demo Mode**: Built-in "Showing Purpose" features that allow for full functionality demonstration even without physical hardware connected.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui.
- **Mobile**: Capacitor 5 (Android Native Bridge).
- **Firmware**: C++ (ESP32), WebServer, DHT11, I2C LiquidCrystal.

## 📱 Mobile App (Android)

The project includes a fully configured Android source directory (`/android`) with:
- **Cleartext HTTP Support**: Configured to work with local IP addresses on modern Android versions (Android 10+).
- **Network Security Protocols**: Customized `network_security_config.xml` to allow seamless local IoT communication.
- **Native Performance**: Leverages Capacitor for high-frame-rate UI and native device integration.

## 🔌 ESP32 Integration

The dashboard communicates via standard **REST API Endpoints** hosted on the ESP32:
- `GET /data`: Fetches real-time sensor JSON.
- `GET /motor/on` & `GET /motor/off`: Controls the feeding mechanism.
- `GET /fan/on` & `GET /fan/off`: Manages the cooling system.

## 👨‍💻 Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the dashboard locally.
4. To build the APK, open the `/android` folder in Android Studio and select **Build -> Build APK**.
