---
description: Build APK using Android Studio for Capacitor Project
---

# Build APK in Android Studio

Follow these steps to compile your Capacitor app and generate an APK file.

1.  **Open Android Studio**
    - Launch Android Studio.
    - Select **File > Open**.
    - Navigate to your project folder and select the `android` directory (e.g., `d:\gabriel\develop\gastos\GastosAppBuild\android`).
    - Click **OK**.

2.  **Wait for Sync**
    - Android Studio will start syncing Gradle. Wait for the process to finish (check the bottom right status bar).
    - If asked to update Gradle plugin, it is usually safe to do so, but sticking to the current version is also fine if it works.

3.  **Build the APK**
    - Go to the top menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    - *Note: Do not confuse with "Generate Signed Bundle / APK" unless you are preparing for the Play Store.*

4.  **Locate the File**
    - Wait for the "Build APK(s)" notification to appear in the bottom right.
    - Click on the **locate** link in that notification.
    - Alternatively, navigate manually to:
      `android/app/build/outputs/apk/debug/app-debug.apk`

5.  **Install on Device (Optional)**
    - You can send this `app-debug.apk` to your phone and install it (ensure "Install from unknown sources" is enabled).
    - Or, connect your phone via USB (Debugging enabled) and click the green **Play** button in Android Studio to run it directly.
