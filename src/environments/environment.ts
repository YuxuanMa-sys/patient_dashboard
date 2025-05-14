export const environment = {
    production: false,
    south: false,
    mainstreet: false,
    // apiUrl: 'http://127.0.0.1:8003/api/',
    apiUrl: 'https://admin.4smile.com/public/api/',
    cloudFront: 'https://4smiles3.s3.eu-north-1.amazonaws.com/',
    auth: {
        grant_type: 'password',
        client_id: '9b7608a8-b4da-44a7-916f-1a3142c9e4fa',
        client_secret: 'eGIavaJCbHK8zkJtFV9dVd6WfmhKfdHSAcJw4qTy',
        scope: 'manage-account'
    },
    pusher: {
        key: '475366470398db0f26ec',
        cluster: 'ap2'
    },
    googleMapsApiKey: 'AIzaSyBif9bCI7AyENJGlmWNy48m3Ld1GNiiEto',
    // assets: 'http://127.0.0.1:8003/',
    assets: 'https://admin.4smile.com/public/',

    paypalClient: 'AYh6t5p0UDWxFhJly3JU8O9fq5FvWNR_3Sy0MNyaZd-HSQ47JQpag_LqrYow9bBcZOVknngTMvCiGeaQ',

    firebase: {
        apiKey: "AIzaSyAFl4XAc3TSwSSJFFUEtD7obTBc4PiPcQ4",
        cloudFunctionUrl:'https://us-central1-patient-f3607.cloudfunctions.net',
        authDomain: "patient-f3607.firebaseapp.com",
        projectId: "patient-f3607",
        storageBucket: "patient-f3607.appspot.com",
        messagingSenderId: "798482947447",
        appId: "1:798482947447:web:85dcab51c4f5fca6c55572",
        measurementId: "G-2ZXG3CDYNL",
    },
    //ali faizoon
    cometChat: {
        appId : '2637414635f2647d',
        region: 'US',  // e.g. 'eu'
        apiKey: '378077e656bf268841dd282a7f5da5f534bbeb01'
    },
    APP_ID: '2637414635f2647d',
    REGION: 'US',
    AUTH_KEY: '378077e656bf268841dd282a7f5da5f534bbeb01',
};
