'use strict';

const url = 'https://clanverse.com/api/stats';

const getServerJSON = function getServerJSON(callback){
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
};

const getTotalPlayers = function getTotalPlayers(json){
  let total = 0;

  json.forEach((server) => {
    total += server.players;
  });

  return total;
};

const backgroundTask = function backgroundTask(){
  getServerJSON(function(err, json){
    if(err) return;

    const players = getTotalPlayers(json.servers);

    chrome.browserAction.setBadgeText({ text: String(players) });
    if (players > 0) {
      chrome.browserAction.setBadgeBackgroundColor({ color: '#00cc00' });
    } else {
      chrome.browserAction.setBadgeBackgroundColor({ color: '#ff3300' });
    }

    chrome.storage.sync.set({servers: json.servers});
    chrome.storage.sync.set({serverTotal: players});
    chrome.storage.sync.set({pugs: json.pugs});
    chrome.storage.sync.get(['favourite'], (storageObject) => {
      if(!storageObject.favourite){
        chrome.storage.sync.set({favourite: 'Servers'});
      } else {
        if(storageObject.favourite !== 'Servers'){
          json.pugs.forEach((pug) => {
            if(pug.queue_name === storageObject.favourite){
              chrome.browserAction.setBadgeText({ text: String(pug.players.length) });
              if(pug.players.length === 0){
                chrome.browserAction.setBadgeBackgroundColor({ color: '#ff3300' });
              } else {
                chrome.browserAction.setBadgeBackgroundColor({ color: '#00cc00' });
              }
            }
          });
        }
      }
    });
  });  
}

chrome.runtime.onInstalled.addListener(details => {
  backgroundTask();
  setInterval(function(){
    backgroundTask();
  }, 60000);
});
