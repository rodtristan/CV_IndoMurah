import java.io.FileInputStream
import java.util.Properties

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Release signing: read from android/key.properties (gitignored, never
// committed). See mobile/README.md "Rilis (APK bertanda tangan)" for how to
// create the keystore with keytool. Without it, release builds FAIL instead of
// silently falling back to the debug key.
val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = Properties()
val hasReleaseKeystore = keystorePropertiesFile.exists()
if (hasReleaseKeystore) {
    FileInputStream(keystorePropertiesFile).use { keystoreProperties.load(it) }
}

android {
    namespace = "com.tokocvindomurah.toko_cv_indomurah_absensi"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.tokocvindomurah.toko_cv_indomurah_absensi"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        // flutter_secure_storage 10.x needs API 23+; keep at least that.
        minSdk = maxOf(flutter.minSdkVersion, 23)
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                keyAlias = keystoreProperties.getProperty("keyAlias")
                keyPassword = keystoreProperties.getProperty("keyPassword")
                storeFile = keystoreProperties.getProperty("storeFile")?.let { rootProject.file(it) }
                storePassword = keystoreProperties.getProperty("storePassword")
            }
        }
    }

    buildTypes {
        release {
            // Never sign release with the debug key. When key.properties is
            // missing, the release signing config stays unset and the task
            // graph check below aborts the build with a clear message.
            signingConfig = if (hasReleaseKeystore) signingConfigs.getByName("release") else null
        }
    }
}

gradle.taskGraph.whenReady {
    val releaseTask = allTasks.firstOrNull { t ->
        t.project == project &&
            (t.name == "assembleRelease" || t.name == "bundleRelease" ||
                t.name == "packageRelease" || t.name == "packageReleaseBundle")
    }
    if (releaseTask != null) {
        if (!hasReleaseKeystore) {
            throw GradleException(
                "Release build membutuhkan android/key.properties (keystore rilis). " +
                    "File tidak ditemukan: ${keystorePropertiesFile.absolutePath}. " +
                    "Lihat mobile/README.md bagian 'Rilis (APK bertanda tangan)'."
            )
        }
        val storeFile = keystoreProperties.getProperty("storeFile")?.let { rootProject.file(it) }
        val missing = listOf("storeFile", "storePassword", "keyAlias", "keyPassword")
            .filter { keystoreProperties.getProperty(it).isNullOrBlank() }
        if (missing.isNotEmpty() || storeFile == null || !storeFile.exists()) {
            throw GradleException(
                "android/key.properties tidak lengkap/keystore tidak ada " +
                    "(kosong: ${missing.joinToString()}; storeFile=${storeFile?.absolutePath}). " +
                    "Lihat mobile/README.md."
            )
        }
    }
}

flutter {
    source = "../.."
}
