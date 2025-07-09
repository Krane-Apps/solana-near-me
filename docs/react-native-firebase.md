React Native Firebase
Welcome to React Native Firebase! To get started, you must first setup a Firebase project and install the "app" module.

Migrating to v22 »
React Native Firebase has begun to deprecate the namespaced API (i.e firebase-js-sdk < v9 chaining API). React Native Firebase will be moving to the modular API (i.e. firebase-js-sdk >= v9) in the next major release. See migration guide for more information.

React Native Firebase is the officially recommended collection of packages that brings React Native support for all Firebase services on both Android and iOS apps.

React Native Firebase fully supports React Native apps built using React Native CLI or using Expo.

Prerequisites
Before getting started, the documentation assumes you are able to create a project with React Native and that you have an active Firebase project. If you do not meet these prerequisites, follow the links below:

React Native - Setting up the development environment
Create a new Firebase project
Additionally, current versions of firebase-ios-sdk have a minimum Xcode requirement of 15.2, which implies a minimum macOS version of 13.5 (macOS Ventura).

Installation for Expo projects
Integration with Expo is possible when using a development build. You can configure the project via config plugins or manually configure the native projects yourself (the "bare workflow").

NOTE: React Native Firebase cannot be used in the pre-compiled Expo Go app because React Native Firebase uses native code that is not compiled into Expo Go.

Warning: If you are using expo-dev-client, native crashes (such as those triggered by crashlytics().crash()) will not be reported to Firebase Crashlytics during development. This is because expo-dev-client provides a custom error overlay that catches and displays errors before they are sent to Firebase. To test native crash reporting, you must remove expo-dev-client and run your app in a standard release or debug build without the custom error overlay.

To create a new Expo project, see the Get started guide in Expo documentation.

Install React Native Firebase modules
To install React Native Firebase's base app module, use the command npx expo install @react-native-firebase/app.

Similarly you can install other React Native Firebase modules such as for Authentication and Crashlytics: npx expo install @react-native-firebase/auth @react-native-firebase/crashlytics.

Configure React Native Firebase modules
The recommended approach to configure React Native Firebase is to use Expo Config Plugins. You will add React Native Firebase modules to the plugins array of your app.json or app.config.js. See the note below to determine which modules require Config Plugin configurations.

If you are instead manually adjusting your Android and iOS projects (this is not recommended), follow the same instructions as [React Native CLI projects](#Installation for React Native CLI (non-Expo) projects).

To enable Firebase on the native Android and iOS platforms, create and download Service Account files for each platform from your Firebase project. Then provide paths to the downloaded google-services.json and GoogleService-Info.plist files in the following app.json fields: expo.android.googleServicesFile and expo.ios.googleServicesFile. See the example configuration below.

For iOS only, since firebase-ios-sdk requires use_frameworks then you want to configure expo-build-properties app.json by adding "useFrameworks": "static". See the example configuration below.

The following is an example app.json to enable the React Native Firebase modules App, Auth and Crashlytics, that specifies the Service Account files for both mobile platforms, and that sets the application ID to the example value of com.mycorp.myapp (change to match your own):

{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.mycorp.myapp"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "bundleIdentifier": "com.mycorp.myapp"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}
Listing a module in the Config Plugins (the "plugins" array in the JSON above) is only required for React Native Firebase modules that involve native installation steps - e.g. modifying the Xcode project, Podfile, build.gradle, AndroidManifest.xml etc. React Native Firebase modules without native steps will work out of the box; no "plugins" entry is required. Not all modules have Expo Config Plugins provided yet. A React Native Firebase module has Config Plugin support if it contains an app.plugin.js file in its package directory (e.g.node_modules/@react-native-firebase/app/app.plugin.js).

Local app compilation
If you are compiling your app locally, run npx expo prebuild --clean to generate the native project directories. Then, follow the local app compilation steps described in Local app development guide in Expo docs. If you prefer using a build service, refer to EAS Build.

Note: if you have already installed an Expo development build (using something like npx expo run after doing the --prebuild local development steps...) before installing react-native-firebase, then you must uninstall it first as it will not contain the react-native-firebase native modules and you will get errors with RNFBAppModule not found etc. If so, uninstall the previous development build, do a clean build using npx expo prebuild --clean, and then attempt npx expo run:<platform> again.

Expo Tools for VSCode
If you are using the Expo Tools VSCode extension, the IntelliSense will display a list of available plugins when editing the plugins section of app.json.

Installation for React Native CLI (non-Expo) projects
Installing React Native Firebase to a RN CLI project requires a few steps; installing the NPM module, adding the Firebase config files & rebuilding your application.

1. Install via NPM
Install the React Native Firebase "app" module to the root of your React Native project with NPM or Yarn:

# Using npm
npm install --save @react-native-firebase/app

# Using Yarn
yarn add @react-native-firebase/app
The @react-native-firebase/app module must be installed before using any other Firebase service.

2. React Native CLI - Android Setup
To allow the Android app to securely connect to your Firebase project, a configuration file must be downloaded and added to your project.

Generating Android credentials
On the Firebase console, add a new Android application and enter your projects details. The "Android package name" must match your local projects package name which can be found inside of the namespace field in /android/app/build.gradle, or in the manifest tag within the /android/app/src/main/AndroidManifest.xml file within your project for projects using android gradle plugin v7 and below

The debug signing certificate is optional to use Firebase with your app, but is required for Dynamic Links, Invites and Phone Authentication. To generate a certificate run cd android && ./gradlew signingReport. This generates two variant keys. You have to copy both 'SHA1' and 'SHA-256' keys that belong to the 'debugAndroidTest' variant key option. Then, you can add those keys to the 'SHA certificate fingerprints' on your app in Firebase console.

Download the google-services.json file and place it inside of your project at the following location: /android/app/google-services.json.

Configure Firebase with Android credentials
To allow Firebase on Android to use the credentials, the google-services plugin must be enabled on the project. This requires modification to two files in the Android directory.

First, add the google-services plugin as a dependency inside of your /android/build.gradle file:

buildscript {
  dependencies {
    // ... other dependencies
    classpath 'com.google.gms:google-services:4.4.3'
    // Add me --- /\
  }
}
Lastly, execute the plugin by adding the following to your /android/app/build.gradle file:

apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services' // <- Add this line
3. React Native CLI - iOS Setup
To allow the iOS app to securely connect to your Firebase project, a configuration file must be downloaded and added to your project, and you must enable frameworks in CocoaPods

Generating iOS credentials
On the Firebase console, add a new iOS application and enter your projects details. The "iOS bundle ID" must match your local project bundle ID. The bundle ID can be found within the "General" tab when opening the project with Xcode.

Download the GoogleService-Info.plist file.

Using Xcode, open the projects /ios/{projectName}.xcodeproj file (or /ios/{projectName}.xcworkspace if using Pods).

Right click on the project name and "Add files" to the project, as demonstrated below:

Add files via Xcode
Add files via Xcode

Select the downloaded GoogleService-Info.plist file from your computer, and ensure the "Copy items if needed" checkbox is enabled.

Select 'Copy Items if needed'
Select 'Copy Items if needed'

Configure Firebase with iOS credentials (react-native 0.77+)
To allow Firebase on iOS to use the credentials, the Firebase iOS SDK must be configured during the bootstrap phase of your application.

To do this, open your /ios/{projectName}/AppDelegate.swift file and add the following:

At the top of the file, import the Firebase SDK right after 'import ReactAppDependencyProvider':

import Firebase
Within your existing application method, add the following to the top of the method:

  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
  // Add me --- \/
  FirebaseApp.configure()
  // Add me --- /\
  // ...
}
Configure Firebase with iOS credentials (react-native < 0.77)
To allow Firebase on iOS to use the credentials, the Firebase iOS SDK must be configured during the bootstrap phase of your application.

To do this, open your /ios/{projectName}/AppDelegate.mm file (or AppDelegate.m if on older react-native), and add the following:

At the top of the file, import the Firebase SDK right after '#import "AppDelegate.h"':

#import <Firebase.h>
Within your existing didFinishLaunchingWithOptions method, add the following to the top of the method:

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  // Add me --- \/
  [FIRApp configure];
  // Add me --- /\
  // ...
}
Altering CocoaPods to use frameworks
Beginning with firebase-ios-sdk v9+ (react-native-firebase v15+) you must tell CocoaPods to use frameworks.

Open the file ./ios/Podfile and add this line inside your targets (right before the use_react_native line in current react-native releases that calls the react native Podfile function to get the native modules config):

use_frameworks! :linkage => :static
To use Static Frameworks on iOS, you also need to manually enable this for the project with the following global to your /ios/Podfile file:

# right after `use_frameworks! :linkage => :static`
$RNFirebaseAsStaticFramework = true
Notes: React-Native-Firebase uses use_frameworks, which has compatibility issues with Flipper & Fabric.

Flipper: use_frameworks is not compatible with Flipper. You must disable Flipper by commenting out the :flipper_configuration line in your Podfile. Flipper is deprecated in the react-native community and this will not be fixed - Flipper and react-native-firebase will never work together on iOS.

New Architecture: Fabric is partially compatible with use_frameworks!. If you enable the bridged / compatibility mode, react-native-firebase will compile correctly and be usable.

4. Autolinking & rebuilding
Once the above steps have been completed, the React Native Firebase library must be linked to your project and your application needs to be rebuilt.

Users on React Native 0.60+ automatically have access to "autolinking", requiring no further manual installation steps. To automatically link the package, rebuild your project:

# Android apps
npx react-native run-android

# iOS apps
cd ios/
pod install --repo-update
cd ..
npx react-native run-ios
Once successfully linked and rebuilt, your application will be connected to Firebase using the @react-native-firebase/app module. This module does not provide much functionality, therefore to use other Firebase services, each of the modules for the individual Firebase services need installing separately.

Other / Web
If you are using the firebase-js-sdk fallback support for web or "other" platforms then you must initialize Firebase dynamically by calling initializeApp.

However, you only want to do this for the web platform. For non-web / native apps the "default" firebase app instance will already be configured by the native google-services.json / GoogleServices-Info.plist files as mentioned above.

At some point during your application's bootstrap processes, initialize firebase like this:

import { getApp, initializeApp } from '@react-native-firebase/app';

// web requires dynamic initialization on web prior to using firebase
if (Platform.OS === 'web') {
  const firebaseConfig = {
    // ... config items pasted from firebase console for your web app here
  };

  initializeApp(firebaseConfig);
}

// ...now throughout your app, use firebase APIs normally, for example:
const firebaseApp = getApp();
Miscellaneous
Overriding Native SDK Versions
React Native Firebase internally sets the versions of the native SDKs which each module uses. Each release of the library is tested against a fixed set of SDK versions (e.g. Firebase SDKs), allowing us to be confident that every feature the library supports is working as expected.

Sometimes it's required to change these versions to play nicely with other React Native libraries or to work around temporary build failures; therefore we allow manually overriding these native SDK versions.

Using your own SDK versions is not recommended and not supported as it can lead to unexpected build failures when new react-native-firebase versions are released that expect to use new SDK versions. Proceed with caution and remove these overrides as soon as possible when no longer needed.

Android
Within your projects /android/build.gradle file, provide your own versions by specifying any of the following options shown below:

project.ext {
  set('react-native', [
    versions: [
      // Overriding Build/Android SDK Versions
      android : [
        minSdk    : 21, // 23+ if using auth module
        targetSdk : 33,
        compileSdk: 34,
      ],

      // Overriding Library SDK Versions
      firebase: [
        // Override Firebase SDK Version
        bom           : "33.16.0"
      ],
    ],
  ])
}
Once changed, rebuild your application with npx react-native run-android.

iOS
Open your projects /ios/Podfile and add any of the globals shown below to the top of the file:

# Override Firebase SDK Version
$FirebaseSDKVersion = '11.15.0'
Once changed, reinstall your projects pods via pod install and rebuild your project with npx react-native run-ios.

Alternatively, if you cannot edit the Podfile easily (as when using Expo), you may add the environment variable FIREBASE_SDK_VERSION=11.15.0 (or whatever version you need) to the command line that installs pods. For example FIREBASE_SDK_VERSION=11.15.0 yarn expo prebuild --clean

Android Performance
On Android, React Native Firebase uses thread pool executor to provide improved performance and managed resources. To increase throughput, you can tune the thread pool executor via firebase.json file within the root of your project:

// <project-root>/firebase.json
{
  "react-native": {
    "android_task_executor_maximum_pool_size": 10,
    "android_task_executor_keep_alive_seconds": 3
  }
}
Key	Description
android_task_executor_maximum_pool_size	Maximum pool size of ThreadPoolExecutor. Defaults to 1. Larger values typically improve performance when executing large numbers of asynchronous tasks, e.g. Firestore queries. Setting this value to 0 completely disables the pooled executor and all tasks execute in serial per module.
android_task_executor_keep_alive_seconds	Keep-alive time of ThreadPoolExecutor, in seconds. Defaults to 3. Excess threads in the pool executor will be terminated if they have been idle for more than the keep-alive time. This value doesn't have any effect when the maximum pool size is lower than 2.

Migrating to v22
Migrate to React Native Firebase v22.

TypeScript »
Switching off warning logs
You may notice a lot of console warning logs as we deprecate the existing namespaced API. If you would like to switch these logs off, you may set the following global property to true anywhere before you initialize Firebase.

globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
Enabling deprecation strict modes
You may enable a feature for the API migration which will throw a javascript error immediately when any namespaced API usage is detected.

This is useful to help you quickly locate any remaining usage of the deprecated namespace API via examination of the line numbers in the stack trace.

Note that there may be modular API implementation errors within the react-native-firebase modules, this may still be useful as a troubleshooting aid when collaborating with the maintainers to correct these errors.

globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE = true;
Migrating to React Native modular API
If you are familiar with the Firebase JS SDK, the upgrade will be a familiar process, following similar steps to the migration guide for firebase-js-sdk.

React Native Firebase uses the same API as the official Firebase JS SDK modular API documentation so the same migration steps apply here, except there is no need for special "compat" imports as an intermediate step.

The process will always follow the same steps for every API you use:

determine the new modular API function for the old namespaced API you are using
import that new modular API function
change the call from using the firebase module to access the API and passing parameters, to the new style of using the modular API function, passing in the firebase module object(s) required for it to work and then the parameters.
In the end, it should be a very mechanical process and can be done incrementally, one API call at a time.

There are concrete examples below to show the process

Firestore Deprecation Example
Namespaced (deprecated) Query
You ought to move away from the following way of making Firestore queries. The React Native Firebase namespaced API is being completely removed in React Native Firebase v22:

import firestore from '@react-native-firebase/firestore';

const db = firestore();

const querySnapshot = await db.collection('cities').where('capital', '==', true).get();

querySnapshot.forEach(doc => {
  console.log(doc.id, ' => ', doc.data());
});
Modular Query
This is how the same query would look using the new, React Native Firebase modular API:

import { collection, query, where, getDocs, getFirestore } from '@react-native-firebase/firestore';

const db = getFirestore();

const q = query(collection(db, 'cities'), where('capital', '==', true));

const querySnapshot = await getDocs(q);

querySnapshot.forEach(doc => {
  console.log(doc.id, ' => ', doc.data());
});
For more examples of requesting Firestore data, see the official Firebase documentation for Get data with Cloud Firestore.

Migration Help
You will find code snippets for "Web namespaced API" and "Web modular API" throughout the official Firebase documentation. Update your code to use "Web modular API". Here are some links to help you get started:

Firestore
Auth
RTDB
Storage
Remote Config
Messaging
Functions
App Check
Analytics
Perf
Crashlytics (Crashlytics doesn't exist on Firebase web, this is a link to the type declarations which contains all methods available).

Get started with Cloud Firestore

bookmark_border


This quickstart shows you how to set up Cloud Firestore, add data, then view the data you just added in the Firebase console.

Create a Cloud Firestore database
If you haven't already, create a Firebase project: In the Firebase console, click Add project, then follow the on-screen instructions to create a Firebase project or to add Firebase services to an existing Google Cloud project.

Open your project in the Firebase console. In the left panel, expand Build and then select Firestore database.

Click Create database.

Select a location for your database.

If you aren't able to select a location, then your project's "location for default Google Cloud resources" has already been set. Some of your project's resources (like the default Cloud Firestore instance) share a common location dependency, and their location can be set either during project creation or when setting up another service that shares this location dependency.

Select a starting mode for your Cloud Firestore Security Rules:

Test mode
Good for getting started with the mobile and web client libraries, but allows anyone to read and overwrite your data. After testing, make sure to review the Secure your data section.

To get started with the web, Apple platforms, or Android SDK, select test mode.

Locked mode
Denies all reads and writes from mobile and web clients. Your authenticated application servers (C#, Go, Java, Node.js, PHP, Python, or Ruby) can still access your database.

To get started with the C#, Go, Java, Node.js, PHP, Python, or Ruby server client library, select locked mode.

Your initial set of Cloud Firestore Security Rules will apply to your default Cloud Firestore database. If you create multiple databases for your project, you can deploy Cloud Firestore Security Rules for each database.

Click Create.

Cloud Firestore and App Engine: You can't use both Cloud Firestore and Datastore in the same project, which might affect apps using App Engine. Try using Cloud Firestore with a different project.
When you enable Cloud Firestore, it also enables the API in the Cloud API Manager.

Set up your development environment
Add the required dependencies and client libraries to your app.

Web
Web
iOS+
Android
Dart
Java
Python
More
Follow the instructions to add Firebase to your web app.
The Cloud Firestore SDK is available as an npm package.

npm install firebase@11.10.0 --save
You'll need to import both Firebase and Cloud Firestore.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
Looking for a compact Firestore library, and only need simple REST/CRUD capabilities? Try the Firestore Lite SDK, available only via npm.
(Optional) Prototype and test with Firebase Local Emulator Suite
For mobile developers, before talking about how your app writes to and reads from Cloud Firestore, let's introduce a set of tools you can use to prototype and test Cloud Firestore functionality: Firebase Local Emulator Suite. If you're trying out different data models, optimizing your security rules, or working to find the most cost-effective way to interact with the back-end, being able to work locally without deploying live services can be a great idea.

A Cloud Firestore emulator is part of the Local Emulator Suite, which enables your app to interact with your emulated database content and config, as well as optionally your emulated project resources (functions, other databases, and security rules).

Using the Cloud Firestore emulator involves just a few steps:

Adding a line of code to your app's test config to connect to the emulator.
From the root of your local project directory, running firebase emulators:start.
Making calls from your app's prototype code using a Cloud Firestore platform SDK as usual.
A detailed walkthrough involving Cloud Firestore and Cloud Functions is available. You should also have a look at the Local Emulator Suite introduction.

Initialize Cloud Firestore
Initialize an instance of Cloud Firestore:

Web
Web
Swift
Objective-C
Kotlin
Java
More

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
    FIREBASE_CONFIGURATION
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
Replace FIREBASE_CONFIGURATION with your web app's firebaseConfig.

To persist data when the device loses its connection, see the Enable Offline Data documentation.

Add data
Cloud Firestore stores data in Documents, which are stored in Collections. Cloud Firestore creates collections and documents implicitly the first time you add data to the document. You do not need to explicitly create collections or documents.

Create a new collection and a document using the following example code.

Web
Web
Swift
Objective-C
Kotlin
Java
More

import { collection, addDoc } from "firebase/firestore"; 

try {
  const docRef = await addDoc(collection(db, "users"), {
    first: "Ada",
    last: "Lovelace",
    born: 1815
  });
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}
Now add another document to the users collection. Notice that this document includes a key-value pair (middle name) that does not appear in the first document. Documents in a collection can contain different sets of information.

Web
Web
Swift
Objective-C
Kotlin
Java
More

// Add a second document with a generated ID.
import { addDoc, collection } from "firebase/firestore"; 

try {
  const docRef = await addDoc(collection(db, "users"), {
    first: "Alan",
    middle: "Mathison",
    last: "Turing",
    born: 1912
  });

  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}
Read data
Use the data viewer in the Firebase console to quickly verify that you've added data to Cloud Firestore.

You can also use the "get" method to retrieve the entire collection.

Web
Web
Swift
Objective-C
Kotlin
Java
More

import { collection, getDocs } from "firebase/firestore"; 

const querySnapshot = await getDocs(collection(db, "users"));
querySnapshot.forEach((doc) => {
  console.log(`${doc.id} => ${doc.data()}`);
});
Secure your data
If you're using the web, Android, or Apple platforms SDK, use Firebase Authentication and Cloud Firestore Security Rules to secure your data in Cloud Firestore.

Here are some basic rule sets you can use to get started. You can modify your security rules in the Rules tab of the console.

Auth required
Locked mode

// Allow read/write access to a document keyed by the user's UID
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
Before you deploy your web, Android, or iOS app to production, also take steps to ensure that only your app clients can access your Cloud Firestore data. See the App Check documentation.

If you're using one of the server SDKs, use Identity and Access Management (IAM) to secure your data in Cloud Firestore.

Cloud Firestore
Installation and getting started with Firestore.

« Multi-factor Auth
Usage with FlatLists »
Installation
This module requires that the @react-native-firebase/app module is already setup and installed. To install the "app" module, view the Getting Started documentation.

# Install & setup the app module
yarn add @react-native-firebase/app

# Install the firestore module
yarn add @react-native-firebase/firestore

# If you're developing your app using iOS, run this command
cd ios/ && pod install
If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project, you can follow the manual installation steps for iOS and Android.

If you have started to receive a app:mergeDexDebug error after adding Cloud Firestore, please read the Enabling Multidex documentation for more information on how to resolve this error.

What does it do
Firestore is a flexible, scalable NoSQL cloud database to store and sync data. It keeps your data in sync across client apps through realtime listeners and offers offline support so you can build responsive apps that work regardless of network latency or Internet connectivity.


Usage
Collections & Documents
Cloud Firestore stores data within "documents", which are contained within "collections", and documents can also contain collections. For example, we could store a list of our users documents within a "Users" collection. The collection method allows us to reference a collection within our code:

import firestore from '@react-native-firebase/firestore';

const usersCollection = firestore().collection('Users');
The collection method returns a CollectionReference class, which provides properties and methods to query and fetch the data from Cloud Firestore. We can also directly reference a single document on the collection by calling the doc method:

import firestore from '@react-native-firebase/firestore';

// Get user document with an ID of ABC
const userDocument = firestore().collection('Users').doc('ABC');
The doc method returns a DocumentReference.

A document can contain different types of data, including scalar values (strings, booleans, numbers), arrays (lists) and objects (maps) along with specific Cloud Firestore data such as Timestamps, GeoPoints, Blobs and more.

Read Data
Cloud Firestore provides the ability to read the value of a collection or document. This can be read one-time, or provide realtime updates when the data within a query changes.

One-time read
To read a collection or document once, call the get method on a CollectionReference or DocumentReference:

import firestore from '@react-native-firebase/firestore';

const users = await firestore().collection('Users').get();
const user = await firestore().collection('Users').doc('ABC').get();
Realtime changes
To setup an active listener to react to any changes to the query, call the onSnapshot method with an event handler callback. For example, to watch the entire "Users" collection for when any documents are changed (removed, added, modified):

import firestore from '@react-native-firebase/firestore';

function onResult(QuerySnapshot) {
  console.log('Got Users collection result.');
}

function onError(error) {
  console.error(error);
}

firestore().collection('Users').onSnapshot(onResult, onError);
The onSnapshot method also returns a function, allowing you to unsubscribe from events. This can be used within any useEffect hooks to automatically unsubscribe when the hook needs to unsubscribe itself:

import React, { useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';

function User({ userId }) {
  useEffect(() => {
    const subscriber = firestore()
      .collection('Users')
      .doc(userId)
      .onSnapshot(documentSnapshot => {
        console.log('User data: ', documentSnapshot.data());
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [userId]);
}
Realtime changes via the onSnapshot method can be applied to both collections and documents.

Snapshots
Once a query has returned a result, Firestore returns either a QuerySnapshot (for collection queries) or a DocumentSnapshot (for document queries). These snapshots provide the ability to view the data, view query metadata (such as whether the data was from local cache), whether the document exists or not and more.

QuerySnapshot
A QuerySnapshot returned from a collection query allows you to inspect the collection, such as how many documents exist within it, access to the documents within the collection, any changes since the last query and more.

To access the documents within a QuerySnapshot, call the forEach method:

import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .get()
  .then(querySnapshot => {
    console.log('Total users: ', querySnapshot.size);

    querySnapshot.forEach(documentSnapshot => {
      console.log('User ID: ', documentSnapshot.id, documentSnapshot.data());
    });
  });
Each child document of a QuerySnapshot is a QueryDocumentSnapshot, which allows you to access specific information about a document (see below).

DocumentSnapshot
A DocumentSnapshot is returned from a query to a specific document, or as part of the documents returned via a QuerySnapshot. The snapshot provides the ability to view a documents data, metadata and whether a document actually exists.

To view a documents data, call the data method on the snapshot:

import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .get()
  .then(documentSnapshot => {
    console.log('User exists: ', documentSnapshot.exists);

    if (documentSnapshot.exists) {
      console.log('User data: ', documentSnapshot.data());
    }
  });
A snapshot also provides a helper function to easily access deeply nested data within a document. Call the get method with a dot-notated path:

function getUserZipCode(documentSnapshot) {
  return documentSnapshot.get('info.address.zipcode');
}

firestore()
  .collection('Users')
  .doc('ABC')
  .get()
  .then(documentSnapshot => getUserZipCode(documentSnapshot))
  .then(zipCode => {
    console.log('Users zip code is: ', zipCode);
  });
Querying
Cloud Firestore offers advanced capabilities for querying collections.

Filtering
To filter documents within a collection, the where method can be chained onto a collection reference. Filtering supports equality checks and "in" queries. For example, to filter users where their age is greater or equal than 18 years old:

firestore()
  .collection('Users')
  // Filter results
  .where('age', '>=', 18)
  .get()
  .then(querySnapshot => {
    /* ... */
  });
Cloud Firestore also supports array membership queries. For example, to filter users who speak both English (en) or French (fr), use the in filter:

firestore()
  .collection('Users')
  // Filter results
  .where('languages', 'in', ['en', 'fr'])
  .get()
  .then(querySnapshot => {
    /* ... */
  });
To learn more about all of the querying capabilities Cloud Firestore has to offer, view the Firebase documentation.

It is now possible to use the Filter instance to make queries. They can be used with the existing query API. For example, you could chain like so:

const snapshot = await firestore()
  .collection('Users')
  .where(Filter('user', '==', 'Tim'))
  .where('email', '==', 'tim@example.com')
  .get();
You can use the Filter.and() static method to make logical AND queries:

const snapshot = await firestore()
  .collection('Users')
  .where(Filter.and(Filter('user', '==', 'Tim'), Filter('email', '==', 'tim@example.com')))
  .get();
You can use the Filter.or() static method to make logical OR queries:

const snapshot = await firestore()
  .collection('Users')
  .where(
    Filter.or(
      Filter.and(Filter('user', '==', 'Tim'), Filter('email', '==', 'tim@example.com')),
      Filter.and(Filter('user', '==', 'Dave'), Filter('email', '==', 'dave@example.com')),
    ),
  )
  .get();
For an understanding of what queries are possible, please consult the query limitation documentation on the official Firebase Firestore documentation.

Limiting
To limit the number of documents returned from a query, use the limit method on a collection reference:

firestore()
  .collection('Users')
  // Filter results
  .where('age', '>=', 18)
  // Limit results
  .limit(20)
  .get()
  .then(querySnapshot => {
    /* ... */
  });
The above example both filters the users by age and limits the documents returned to 20.

Ordering
To order the documents by a specific value, use the orderBy method:

firestore()
  .collection('Users')
  // Order results
  .orderBy('age', 'desc')
  .get()
  .then(querySnapshot => {
    /* ... */
  });
The above example orders all user in the snapshot by age in descending order.

Start/End
To start and/or end the query at a specific point within the collection, you can pass either a value to the startAt, endAt, startAfter or endBefore methods. You must specify an order to use pointers, for example:

firestore()
  .collection('Users')
  .orderBy('age', 'desc')
  .startAt(18)
  .endAt(30)
  .get()
  .then(querySnapshot => {
    /* ... */
  });
The above query orders the users by age in descending order, but only returns users whose age is between 18 and 30.

You can further specify a DocumentSnapshot instead of a specific value. For example:

const userDocumentSnapshot = await firestore().collection('Users').doc('DEF').get();

firestore()
  .collection('Users')
  .orderBy('age', 'desc')
  .startAt(userDocumentSnapshot)
  .get()
  .then(querySnapshot => {
    /* ... */
  });
The above query orders the users by age in descending order, however only returns documents whose order starts at the user with an ID of DEF.

Query Limitations
Cloud Firestore does not support the following types of queries:

Queries with range filters on different fields, as described in the previous section.
Writing Data
The Firebase documentation provides great examples on best practices on how to structure your data. We highly recommend reading the guide before building out your database.

For a more in-depth look at what is possible when writing data to Firestore please refer to this documentation

Adding documents
To add a new document to a collection, use the add method on a CollectionReference:

import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .add({
    name: 'Ada Lovelace',
    age: 30,
  })
  .then(() => {
    console.log('User added!');
  });
The add method adds the new document to your collection with a random unique ID. If you'd like to specify your own ID, call the set method on a DocumentReference instead:

import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .set({
    name: 'Ada Lovelace',
    age: 30,
  })
  .then(() => {
    console.log('User added!');
  });
Updating documents
The set method exampled above replaces any existing data on a given DocumentReference. if you'd like to update a document instead, use the update method:

import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .update({
    age: 31,
  })
  .then(() => {
    console.log('User updated!');
  });
The method also provides support for updating deeply nested values via dot-notation:

import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .update({
    'info.address.zipcode': 94040,
  })
  .then(() => {
    console.log('User updated!');
  });
Field values
Cloud Firestore supports storing and manipulating values on your database, such as Timestamps, GeoPoints, Blobs and array management.

To store GeoPoint values, provide the latitude and longitude to a new instance of the class:

firestore()
  .doc('users/ABC')
  .update({
    'info.address.location': new firestore.GeoPoint(53.483959, -2.244644),
  });
To store a Blob (for example of a Base64 image string), provide the string to the static fromBase64String method on the class:

firestore()
  .doc('users/ABC')
  .update({
    'info.avatar': firestore.Blob.fromBase64String('data:image/png;base64,iVBOR...'),
  });
When storing timestamps, it is recommended you use the serverTimestamp static method on the FieldValue class. When written to the database, the Firebase servers will write a new timestamp based on their time, rather than the clients. This helps resolve any data consistency issues with different client timezones:

firestore().doc('users/ABC').update({
  createdAt: firestore.FieldValue.serverTimestamp(),
});
Cloud Firestore also allows for storing arrays. To help manage the values with an array (adding or removing) the API exposes an arrayUnion and arrayRemove methods on the FieldValue class.

To add a new value to an array (if value does not exist, will not add duplicate values):

firestore()
  .doc('users/ABC')
  .update({
    fcmTokens: firestore.FieldValue.arrayUnion('ABCDE123456'),
  });
To remove a value from the array (if the value exists):

firestore()
  .doc('users/ABC')
  .update({
    fcmTokens: firestore.FieldValue.arrayRemove('ABCDE123456'),
  });
Removing data
You can delete documents within Cloud Firestore using the delete method on a DocumentReference:

import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('Users')
  .doc('ABC')
  .delete()
  .then(() => {
    console.log('User deleted!');
  });
At this time, you cannot delete an entire collection without use of a Firebase Admin SDK.

If a document contains any sub-collections, these will not be deleted from database. You must delete any sub-collections yourself.

If you need to remove a specific property with a document, rather than the document itself, you can use the delete method on the FieldValue class:

firestore().collection('Users').doc('ABC').update({
  fcmTokens: firestore.FieldValue.delete(),
});
Transactions
Transactions are a way to always ensure a write occurs with the latest information available on the server. Transactions never partially apply writes & all writes execute at the end of a successful transaction.

Transactions are useful when you want to update a field's value based on its current value, or the value of some other field. If you simply want to write multiple documents without using the document's current state, a batch write would be more appropriate.

When using transactions, note that:

Read operations must come before write operations.
A function calling a transaction (transaction function) might run more than once if a concurrent edit affects a document that the transaction reads.
Transaction functions should not directly modify application state (return a value from the updateFunction).
Transactions will fail when the client is offline.
Imagine a scenario whereby an app has the ability to "Like" user posts. Whenever a user presses the "Like" button, a "likes" value (number of likes) on a "Posts" collection document increments. Without transactions, we'd first need to read the existing value and then increment that value in two separate operations.

On a high traffic application, the value on the server could already have changed by the time the operation sets a new value, causing the actual number to not be consistent.

Transactions remove this issue by atomically updating the value on the server. If the value changes whilst the transaction is executing, it will retry. This always ensures the value on the server is used rather than the client value.

To execute a new transaction, call the runTransaction method:

import firestore from '@react-native-firebase/firestore';

function onPostLike(postId) {
  // Create a reference to the post
  const postReference = firestore().doc(`posts/${postId}`);

  return firestore().runTransaction(async transaction => {
    // Get post data first
    const postSnapshot = await transaction.get(postReference);

    if (!postSnapshot.exists) {
      throw 'Post does not exist!';
    }

    transaction.update(postReference, {
      likes: postSnapshot.data().likes + 1,
    });
  });
}

onPostLike('ABC')
  .then(() => console.log('Post likes incremented via a transaction'))
  .catch(error => console.error(error));
Batch write
If you do not need to read any documents in your operation set, you can execute multiple write operations as a single batch that contains any combination of set, update, or delete operations. A batch of writes completes atomically and can write to multiple documents.

First, create a new batch instance via the batch method, perform operations on the batch and finally commit it once ready. The example below shows how to delete all documents in a collection in a single operation:

import firestore from '@react-native-firebase/firestore';

async function massDeleteUsers() {
  // Get all users
  const usersQuerySnapshot = await firestore().collection('Users').get();

  // Create a new batch instance
  const batch = firestore().batch();

  usersQuerySnapshot.forEach(documentSnapshot => {
    batch.delete(documentSnapshot.ref);
  });

  return batch.commit();
}

massDeleteUsers().then(() => console.log('All users deleted in a single batch operation.'));
Secure your data
It is important that you understand how to write rules in your Firebase console to ensure that your data is secure. Please follow the Firebase Firestore documentation on security.

Offline Capabilities
Firestore provides out of the box support for offline capabilities. When reading and writing data, Firestore uses a local database which synchronizes automatically with the server. Firestore functionality continues when users are offline, and automatically handles data migration to the server when they regain connectivity.

This functionality is enabled by default, however it can be disabled if you need it to be disabled (e.g. on apps containing sensitive information). The settings() method must be called before any Firestore interaction is performed, otherwise it will only take effect on the next app launch:

import firestore from '@react-native-firebase/firestore';

async function bootstrap() {
  await firestore().settings({
    persistence: false, // disable offline persistence
  });
}
Data bundles
Cloud Firestore data bundles are static data files built by you from Cloud Firestore document and query snapshots, and published by you on a CDN, hosting service or other solution. Once a bundle is loaded, a client app can query documents from the local cache or the backend.

To load and query data bundles, use the loadBundle and namedQuery methods:

import firestore from '@react-native-firebase/firestore';

// load the bundle contents
const response = await fetch('https://api.example.com/bundles/latest-stories');
const bundle = await response.text();
await firestore().loadBundle(bundle);

// query the results from the cache
// note: omitting "source: cache" will query the Firestore backend
const query = firestore().namedQuery('latest-stories-query');
const snapshot = await query.get({ source: 'cache' });
You can build data bundles with the Admin SDK. For more information about building and serving data bundles, see Firebase Firestore main documentation on Data bundles as well as their "Bundle Solutions" page

Cloud Firestore Emulator
Using the Cloud Firestore emulator to test your app locally.

« Cloud Firestore
Usage with FlatLists »
You can test your app and its Firestore implementation with an emulator which is built to mimic the behavior of Cloud Firestore. This means you can connect your app directly to the emulator to perform integration testing or QA without touching production data.

For example, you can connect your app to the emulator to safely read and write documents in testing.

Running the emulator
To be able to mimic the behavior of Cloud Firestore, you need to run the emulator. This is effectively a server that will receive and send requests in lieu of Cloud Firestore. This is achieved by running the following commands:

// install the Firebase CLI which will run the emulator
curl -sL firebase.tools | bash

// run this command to start the emulator, it will also install it if this is your first time running the command
firebase emulators:start --only firestore
You should see a firestore-debug.log file in the directory you ran the command which will have a log of all the requests.

Connect to emulator from your app
You need to configure the following property as soon as possible in the startup of your application:

import '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

// set the host and the port property to connect to the emulator
// set these before any read/write operations occur to ensure it doesn't affect your Cloud Firestore data!
if (__DEV__) {
  firestore().useEmulator('localhost', 8080);
}

const db = firestore();
Clear locally stored emulator data
Run the following command to clear the data accumulated locally from using the emulator. Please note that you have to insert your project id in the request at this point [INSERT YOUR PROJECT ID HERE].

curl -v -X DELETE "http://localhost:8080/emulator/v1/projects/[INSERT YOUR PROJECT ID HERE]/databases/(default)/documents"
There are more things that can be achieved with the emulator such as using local rules to test the integrity & security of your database. For further information, please follow the Firebase emulator documentation here.

