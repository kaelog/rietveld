// Copyright 2007, Google Inc.
//
// Redistribution and use in source and binary forms, with or without 
// modification, are permitted provided that the following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice, 
//     this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//  3. Neither the name of Google Inc. nor the names of its contributors may be
//     used to endorse or promote products derived from this software without
//     specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS"" AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF 
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR 
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF 
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Change this to set the name of the managed resource static_store to create.
// You use the name with the createManagedstatic_store, and removeManagedstatic_store,
// and openManagedstatic_store APIs. It isn"t visible to the user.
var static_store_NAME = "rietveld_statics";
var user_store_NAME = "rietveld_user_store";

// Change this to set the URL of tha manifest file, which describe which
// URLs to capture. It can be relative to the current page, or an
// absolute URL.
var MANIFEST_FILENAME = "/static/rietveld_manifest.json";

var localServer;
var static_store;
var user_store;

// Called onload to initialize local server and static_store variables
function init() {
  if (!window.google || !google.gears) {
    textOut("NOTE:  You must install Gears first.");
  } else {
    localServer = google.gears.factory.create("beta.localserver");
    static_store = localServer.createManagedStore(static_store_NAME);
    user_store = localServer.createStore(user_store_NAME) ;
  }
}

// Create the managed resource static_store
function createStore() {
  if (!window.google || !google.gears) {
    textout("You must install Gears first.");
    return;
  }

  static_store.manifestUrl = MANIFEST_FILENAME;
  static_store.checkForUpdate();
    
  var timerId = window.setInterval(function() {
    // When the currentVersion property has a value, all of the resources
    // listed in the manifest file for that version are captured. There is
    // an open bug to surface this state change as an event.
    if (static_store.currentVersion) {
      window.clearInterval(timerId);
      captureUserStore() ;
    } else if (static_store.updateStatus == 3) {
      removeStore() ;
      document.getElementById("offline_image").src="/static/offline_error.gif" ;
      textout("Error: " + static_store.lastErrorMessage);
    }
  }, 500);  

}

// Remove the managed resource static_store.
function removeStore() {
  if (!window.google || !google.gears) {
    textout("You must install Gears first.");
    return;
  }
  
  image = document.getElementById("offline_image") ;
  image.onclick = go_offline ;
  image.src="/static/offline.gif" ;
      
  localServer.removeManagedStore(static_store_NAME);
  textout("Done. The local static_store has been removed." +
          "You will now see online versions of the documents.");
}

function go_offline() {
  if (!window.google || !google.gears) {
    textout("You must install Gears first.");
    return;
  }
  createStore() ;
  
  document.getElementById("offline_image").src="/static/syncing.gif" ;
}

function textout(msg) {
  div = document.getElementById("message") ;
  div.innerHTML = msg ;
  div.style.display = "block" ;
}

function captureUserStore() {
  url = "/offline/list" ;
  var request = google.gears.factory.create('beta.httprequest');
  request.open('GET', url);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
	  var jsonObject = eval('(' + request.responseText + ')');
      textout(jsonObject.urls[0]);
    }
  };
  request.send();
  image = document.getElementById("offline_image") ;
  image.onclick = removeStore ;
  image.src="/static/disconnected.gif" ;
}
