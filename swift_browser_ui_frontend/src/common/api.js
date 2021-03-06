// API fetch functions.

import { getHumanReadableSize } from "@/common/conv";

export async function getUser () {
  // Function to get the username of the currently displayed user.
  let getUserURL = new URL( "/api/username", document.location.origin );
  let uname = fetch(
    getUserURL, { method: "GET", credentials: "same-origin" }
  ).then(
    function( response ) { return response.json(); }
  ).then(
    function( uname ) { return uname; }
  );
  return uname;
}

export async function getProjects () {
  // Fetch available projects from the API
  let getProjectsURL = new URL( "/api/projects", document.location.origin );
  let projects = fetch(
    getProjectsURL, { method: "GET", credentials: "same-origin" }
  ).then(
    function( response ) { return response.json(); }
  ).then(
    function ( ret ) {
      return ret;
    }
  );
  return projects;
}

export async function changeProjectApi ( newProject ) {
  // Change the project that the user is currently browsing
  // Returns true if the project change is successful, otherwise false
  let rescopeURL = new URL( "/login/rescope", document.location.origin );
  rescopeURL.searchParams.append( "project", newProject );
  let ret = fetch(
    rescopeURL, { method: "GET", credentials: "same-origin" }
  ).then(
    function( resp ) {
      return resp.status == 204 ? true : false;
    }
  );
  return ret;
}

export default async function getActiveProject () {
  // Fetch the active project from the API
  // Returns the active project name if the fetch is successful, otherwise
  // returns nothing
  let getProjectURL = new URL( "/api/project/active", 
    document.location.origin );
  let activeProj = fetch(
    getProjectURL, { method: "GET", credentials: "same-origin" }
  ).then(
    function( resp ) {
      return resp.json();
    }
  );
  return activeProj;
}

export async function getBuckets () {
  let getBucketsUrl = new URL( "/api/buckets", document.location.origin );
  // Fetch containers from the API for the user that's currently logged in
  let buckets = fetch(
    getBucketsUrl, { method: "GET", credentials: "same-origin" }
  ).then(
    function ( resp ) { return resp.json(); }
  );
  return buckets;
}

export async function getObjects (container) {
  // Fetch objects contained in a container from the API for the user
  // that's currently logged in.
  let objUrl = new URL( "/api/bucket/objects", document.location.origin );
  // Search parameter named bucket to avoid changing the API after changing
  // over from S3 to Swift
  objUrl.searchParams.append( "bucket", container );
  let objects = fetch(
    objUrl, { method: "GET", credentials: "same-origin" }
  ).then(
    function ( resp ) { return resp.json(); }
  ).then(
    function( ret ) {
      for ( let i = 0; i < ret.length; i++ ) {
        ret[i]["url"] = (
          "/api/object/dload?bucket=" + container +
          "&objkey=" + ret[i]["name"]
        );
      }
      return ret;
    }
  );
  return objects;
}

export async function getSharedObjects (container, url) {
  // Fetch objects contained in a container from the API for the user
  // that's currently logged in.
  let objUrl = new URL( "/api/shared/objects", document.location.origin );
  // Search parameter named bucket to avoid changing the API after changing
  // over from S3 to Swift
  objUrl.searchParams.append( "storageurl", url);
  objUrl.searchParams.append( "container", container );
  let objects = fetch(
    objUrl, { method: "GET", credentials: "same-origin" }
  ).then(
    function ( resp ) { return resp.json(); }
  ).then(
    function( ret ) {
      for ( let i = 0; i < ret.length; i++ ) {
        ret[i]["url"] = (
          "/api/dload?bucket=" + container +
          "&objkey=" + ret[i]["name"]
        );
      }
      return ret;
    }
  );
  return objects;
}

export async function getProjectMeta () {
  // Fetch project metadata for the currently active project, containing
  // the project data usage, container amount and object amount.
  let metaURL = new URL( "/api/project/meta", document.location.origin );
  let ret = fetch(
    metaURL, {method: "GET", credentials: "same-origin" }
  ).then( function ( resp ) { return resp.json(); } )
    .then( function ( json_ret ) {
      let newRet = json_ret;
      newRet["Size"] = getHumanReadableSize(newRet["Bytes"]);
      newRet["Billed"] = parseFloat(newRet["Bytes"] / 1099511627776 * 3.5)
        .toPrecision(4);
      return newRet;
    });
  return ret;
}
