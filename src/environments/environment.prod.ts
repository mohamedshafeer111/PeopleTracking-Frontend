
// export const environment = {
// production: true,
// //   apiUrl: 'http://172.16.100.26:5202/api/'

//    apiUrl : 'https://phcc.purpleiq.ai/api/'
// };


export const environment = {
  production: true,
  apiUrl: 'https://phcc.purpleiq.ai/api/',   // backend API
  wsUrl: 'wss://phcc.purpleiq.ai/ws/ZoneCount', // WebSocket through Apache SSL
  imageBaseUrl: 'https://phcc.purpleiq.ai/uploads/' // for uploaded files
};