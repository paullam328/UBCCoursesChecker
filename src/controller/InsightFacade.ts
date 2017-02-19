/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest, FilterQuery, TypeScriptSucks} from "./IInsightFacade";

import Log from "../Util";
import {isString} from "util";
import {isNumber} from "util";
import {isUndefined} from "util";
import {read} from "fs";

//import {objectify} from "tslint/lib/utils";

export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');

    }


    //set 'that' to higher level because the scope is limited within the promise if it's within the promise

    addDataset(id: string, content: string): Promise<InsightResponse> {
        let that = this;
        return new Promise(function (fulfill, reject) {


            var JSZip = require('jszip');
            var fs = require('fs');
            var zip = new JSZip();

            var arrayOfId: string[] = [];
            var arrayOfUnparsedFileData: any = [];

            var filesNotJsonOrArrayOrHTMLCounter = 0;
            var noOfFiles = 0;

            var arrayCounter = 0;
            var data = '';

            //TODO: For D2
            var parse5 = require('parse5');

            //returns data if it's empty
            //setTimeout(function() {

            zip.loadAsync(content, {'base64': true}).then(function (zipasync: any) { //converts the content string to a JSZip object and loadasync makes everything become a promise

                    zipasync.forEach(function (relativePath: any, file: any) {
                            //setTimeout(function () {
                            //console.time("testingn");
                            if (!(/(.*)\/$/.test(file.name))) { //multi_courses/ VS multi_courses.zip  /(.\*)\//
                                //var filecompressednoasync = file._data.compressedContent;
                                arrayOfUnparsedFileData.push(file.async("string"));
                           }
                            //console.timeEnd("testingn");
                            //}, 500);
                        }
                    );
                    Promise.all(arrayOfUnparsedFileData).then(arrayofUnparsedFileDataAll => {
                        var parsedJSON = '';
                        var isTry = true;

                        for (let i in arrayofUnparsedFileDataAll) {
                            //Log.info(String(arrayofUnparsedFileDataAll[i]));
                            //setTimeout(function() {
                            noOfFiles++;
                            //It can pass to a list of pictures,  and zip

                            //should reject {"result":[],"rank":0} here as well (because it hasn't contain any courses info)
                            //if not result for first key and rank for second key
                            if (!String(arrayofUnparsedFileDataAll[i]).includes("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML+RDFa 1.1//EN\">")) {
                                try {
                                    isTry = true;
                                    var x = String(arrayofUnparsedFileDataAll[i]);//JSON.stringify doesn't work
                                    JSON.parse(x);//JSON.parse
                                }
                                catch (err) {
                                    //filesNotJsonCounter++;
                                    isTry = false;
                                    filesNotJsonOrArrayOrHTMLCounter++;
                                    err;
                                }


                                // case 2: if it's a JSON array, don't store its info
                                if (isTry != false && JSON.parse(String(arrayofUnparsedFileDataAll[i])) instanceof Array) {
                                    isTry = false;
                                    filesNotJsonOrArrayOrHTMLCounter++;
                                }

                                //case 3: if result is blank, don't store its info
                                if (isTry != false) {
                                    var arrayOfKeys = Object.keys(JSON.parse(String(arrayofUnparsedFileDataAll[i])));

                                    if (arrayOfKeys[0] == "result" && arrayOfKeys[1] == "rank") {
                                        if (JSON.parse(String(arrayofUnparsedFileDataAll[i])).result.length == 0) {
                                            isTry = false;
                                            filesNotJsonOrArrayOrHTMLCounter++;
                                        }
                                    } else {
                                        isTry = false;
                                        filesNotJsonOrArrayOrHTMLCounter++;
                                    }
                                }

                                if (isTry) {
                                    parsedJSON += String(arrayofUnparsedFileDataAll[i]) + "\r\n";//JSON.parse
                                }
                                //},100000);
                            } else {

                                var listOfValidShortNames: string[] = [];
                                var listOfValidFullNames: string[] = [];
                                var listOfValidAddresses: string[] = [];
                                var listOfValidUrls: string[] = [];

                                    that.validStringListOfBuildings(that, listOfValidShortNames, listOfValidFullNames, listOfValidAddresses, listOfValidUrls);

                                        var htmlData = parse5.parse(String(arrayofUnparsedFileDataAll[i]));
                                        var rooms_fullname = "";
                                        var rooms_shortname = "";
                                        var rooms_number = ""; //it can be a string (e.g., A101)
                                        var rooms_name = "";
                                        var rooms_address = "";
                                        var rooms_lat = "";
                                        var rooms_lon = "";
                                        var rooms_seats = 0;
                                        var rooms_type = "";
                                        var rooms_furniture = "";
                                        var rooms_href = "";

                                        var readyToBeZoomedInHtmlData;

                                        readyToBeZoomedInHtmlData = htmlData;

                                        readyToBeZoomedInHtmlData = that.setZoomToTagName(readyToBeZoomedInHtmlData, 'html');
                                        readyToBeZoomedInHtmlData = that.setZoomToTagName(readyToBeZoomedInHtmlData, 'body');
                                        readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'full-width-container');
                                        readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'main');
                                        readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'content');
                                        readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'block-system-main');
                                        readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'view-buildings-and-classrooms');

                                try {
                                        var htmlDataFromTable = readyToBeZoomedInHtmlData;

                                        readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'view-content');
                                        readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'views-row');
                                        readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'buildings-wrapper');
                                        readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'building-info');


                                        var htmlDataForFullname = readyToBeZoomedInHtmlData;
                                        htmlDataForFullname = that.setZoomToTagName(htmlDataForFullname, 'h2');
                                        htmlDataForFullname = that.setZoomToClassOrId(htmlDataForFullname, 'field-content');

                                        //rooms_fullname = htmlDataForFullname.childNodes[0].value;
                                    if (!isUndefined(htmlDataForFullname.childNodes)) {
                                        if (listOfValidFullNames.includes(htmlDataForFullname.childNodes[0].value)) {
                                            rooms_fullname = htmlDataForFullname.childNodes[0].value;
                                        }
                                         }
                                } catch (e) {
                                    Log.info("err is:" + e + "and room name includes: " + rooms_fullname);
                                } //try catch just to catch the weirdest error caused by Main Mall Theatre (aka. MAUD)

                                    if (listOfValidFullNames.includes(rooms_fullname)) {
                                        Log.info(rooms_fullname);

                                        var htmlDataForAddress = readyToBeZoomedInHtmlData;
                                        htmlDataForAddress = that.setZoomToClassOrId(htmlDataForAddress, 'building-field');
                                        htmlDataForAddress = that.setZoomToClassOrId(htmlDataForAddress, 'field-content');
                                        rooms_address = htmlDataForAddress.childNodes[0].value;
                                        Log.info(rooms_address);

                                        //start to grab latlon from here:
                                        /*var request = require('request');
                                        var requestedString = request.get('http://skaha.cs.ubc.ca:11316/api/v1/team45/' + rooms_address,function(data:any) {
                                            return data;
                                        });
                                        Log.info("requestedString" + JSON.stringify(requestedString));*/



                                       //requestedString;

                                        var aList:any[] = [];
                                        var beet = "";
                                        var newString = that.getLatLon(rooms_address).then(function(result) {
                                            console.log(result);
                                        });
                                        Promise.all(aList).then(function(final) {
                                            for (let i in final) {
                                                var newbeet= final[i];
                                            }
                                            beet = JSON.stringify(newbeet);
                                        });


                                        Log.info('rooms_latlon:' + newString);
                                        Log.info('rooms_latlon2:' + beet);

                                       Log.info('rooms_lat:' + String(rooms_lat));
                                        Log.info('rooms_lon:' + String(rooms_lon));



                                        //Log.info("requested:" + JSON.stringify(requestedString));

                                        /*var cache:any[] = [];
                                        var hi = JSON.stringify(requestedString, function(key, value) {
                                            if (typeof value === 'object' && value !== null) {
                                                if (cache.indexOf(value) !== -1) {
                                                    // Circular reference found, discard key
                                                    return;
                                                }
                                                // Store value in our collection
                                                cache.push(value);
                                            }
                                            return value;
                                        });
                                        cache = null; // Enable garbage collection

                                        Log.info("requestedString2" + hi);
                                        try {
                                            Log.info("requestedString" + JSON.stringify(requestedString));
                                        } catch (e) {
                                            Log.info("problem is:" + e)
                                        }*/

                                        /*var rp = require('request-promise-native');

                                        try {
                                            var arrayOfAddr: any[] = [];
                                            var arrayOfHtml: any[] = [];
                                            var p = new Promise((fulfill, reject) => {

                                                var htmlStr = "gg";
                                                Log.info("does this even run?");
                                                var html = 'http://skaha.cs.ubc.ca:11316/api/v1/team45/' + rooms_address;
                                                var options = {
                                                    uri: html,
                                                    json: true // Automatically parses the JSON string in the response
                                                };


                                                rp(html)
                                                    .then(function (htmlString: any) {
                                                        Log.info("does this even run2?");
                                                        Log.info("requestedString" + JSON.stringify(htmlString));
                                                        htmlStr = JSON.stringify(htmlString);

                                                    })
                                                    .catch(function (err: Error) {
                                                    Log.info("any error?" + err);
                                                    reject(err);
                                                });
                                                fulfill(htmlStr);
                                            });
                                        } catch (e) {
                                            Log.info("wtf" + e);
                                        }

                                        arrayOfAddr.push(p);

                                        Promise.all(arrayOfAddr).then(value => {
                                            for (let i in value) {
                                                Log.info("requestedString1" + value[i]);
                                            }
                                        });*/

                                        /*var latLonData = parse5.parse('http://skaha.cs.ubc.ca:11316/api/v1/team45/' + rooms_address);
                                        Log.info ("data is: " + JSON.stringify(latLonData));*/





                                        try {
                                            Log.info("list3:" + listOfValidAddresses.toString());
                                        } catch (e) {
                                            Log.info("initial:" + e);
                                        }

                                        if (listOfValidAddresses.includes(rooms_address)) {

                                            rooms_shortname = listOfValidShortNames[listOfValidFullNames.indexOf(rooms_fullname)].replace(/^\s+|\s+$/g, "");
                                            rooms_href = "http://students.ubc.ca" + listOfValidUrls[listOfValidFullNames.indexOf(rooms_fullname)].replace(".", "");

                                            //TODO: parsedJSON will return {result:[...]}
                                            htmlDataFromTable = that.setZoomToClassOrId(htmlDataFromTable, 'view-footer');
                                            htmlDataFromTable = that.setZoomToClassOrId(htmlDataFromTable, 'view-buildings-and-classrooms');
//TODO: Uncomment this
                                            if (!isUndefined(that.setZoomToClassOrId(htmlDataFromTable, 'view-content'))) {
                                                htmlDataFromTable = that.setZoomToClassOrId(htmlDataFromTable, 'view-content');
                                                htmlDataFromTable = that.setZoomToClassOrId(htmlDataFromTable, 'views-table');
                                                htmlDataFromTable = that.setZoomToTagName(htmlDataFromTable, 'tbody');
                                                //Log.info(htmlDataFromTable);

                                                for (let i in htmlDataFromTable.childNodes) {
                                                    //Log.info("a");
                                                    try {
                                                        if (!isUndefined(htmlDataFromTable.childNodes[i].attrs)
                                                            || htmlDataFromTable.childNodes[i].nodeName == "#text") {


                                                            for (let a in htmlDataFromTable.childNodes[i].attrs) {
                                                                if (htmlDataFromTable.childNodes[i].attrs[a].value.includes("odd")
                                                                    || htmlDataFromTable.childNodes[i].attrs[a].value.includes("even")) {
                                                                    var rowHtml = htmlDataFromTable.childNodes[i].childNodes;

                                                                    var roomNumInitial = that.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-field-room-number");
                                                                    var roomNumberNode = that.scanRowForInfoWithoutChildNodes(roomNumInitial, "Room Details");
                                                                    rooms_number = roomNumberNode[0].value.replace(/^\s+|\s+$/g, "");
                                                                    Log.info("rooms_number:" + rooms_number);

                                                                    var roomCapacityNode = that.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-field-room-capacity");
                                                                    rooms_seats = roomCapacityNode[0].value.replace(/^\s+|\s+$/g, "");
                                                                    Log.info("rooms_seats:" + rooms_seats);

                                                                    var roomsFurnitureNode = that.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-field-room-furniture");
                                                                    rooms_furniture = roomsFurnitureNode[0].value.replace(/^\s+|\s+$/g, "");
                                                                    Log.info("rooms_furniture:" + rooms_furniture);

                                                                    var roomsTypeNode = that.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-field-room-type");
                                                                    rooms_type = roomsTypeNode[0].value.replace(/^\s+|\s+$/g, "");
                                                                    Log.info("rooms_type:" + rooms_type);

                                                                    var roomsHrefInitial = that.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-nothing");
                                                                    var roomHrefNode = that.getInnerAttrInsteadOfChildNode(roomsHrefInitial, "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/");
                                                                    //hardcode here:
                                                                    rooms_href = roomHrefNode[0].value.replace(/^\s+|\s+$/g, "");
                                                                    Log.info("rooms_href:" + rooms_href);
                                                                    //var legitRoomNumber = that.setZoomToClassOrId(roomNumInitial, 'Room Details');
                                                                    //tableRowCounter++;
                                                                    //Log.info(String(tableRowCounter));
                                                                    rooms_name = rooms_shortname + "_" + rooms_number;

                                                                    parsedJSON += '{\"result\":[' +
                                                                        '{\"rooms_fullname\":\"' + rooms_fullname + '\",' +
                                                                        '\"rooms_shortname\":\"' + rooms_shortname + '\",' +
                                                                        '\"rooms_number\":\"' + rooms_number + '\",' +
                                                                        '\"rooms_name\":\"' + rooms_name + '\",' +
                                                                        '\"rooms_address\":\"' + rooms_address + '\",' +
                                                                        '\"rooms_lat\":' + rooms_lat + ',' +
                                                                        '\"rooms_lon\":' + rooms_lon + ',' +
                                                                        '\"rooms_seats\":' + rooms_seats + ',' +
                                                                        '\"rooms_type\":\"' + rooms_type + '\",' +
                                                                        '\"rooms_furniture\":\"' + rooms_furniture + '\",' +
                                                                        '\"rooms_href\":\"' + rooms_href + '\"}' +
                                                                        '],\"rank\":0}' + '\r\n';
                                                                }
                                                            }
                                                        }
                                                    } catch (e) {
                                                        Log.info(e);
                                                    }

                                                }

                                            } else {

                                                rooms_name = rooms_shortname;

                                                parsedJSON += '{\"result\":[' +
                                                    '{\"rooms_fullname\":\"' + rooms_fullname + '\",' +
                                                    '\"rooms_shortname\":\"' + rooms_shortname + '\",' +
                                                    '\"rooms_name\":\"' + rooms_name + '\",' +
                                                    '\"rooms_address\":\"' + rooms_address + '\",' +
                                                    '\"rooms_lat\":' + rooms_lat + ',' +
                                                    '\"rooms_lon\":' + rooms_lon + ',' +
                                                    '\"rooms_href\":\"' + rooms_href + '\"}' +
                                                    '],\"rank\":0}' + '\r\n';
                                            }

                                        }
                                    }
                                }


                            //Log.info(parsedJSON);
                       }
                        //Log.info(parsedJSON);
                        return parsedJSON;
                    }).then(function(parsed) {
                        if (noOfFiles == 0) {
                            var ir2: InsightResponse = {code: 400, body: {'error': 'no datafile is found'}};
                            reject(ir2);
                        }

                        if (filesNotJsonOrArrayOrHTMLCounter == noOfFiles) {
                            var ir2: InsightResponse = {code: 400, body: {'error': 'cannot set a valid zip that does not contain any real data.'}};
                            reject(ir2);
                        }
                        return parsed;
                    }).then(function(parsedJ) {

                        if (!fs.existsSync(id) && noOfFiles >  0 && filesNotJsonOrArrayOrHTMLCounter < noOfFiles) {
                            try {
                                fs.writeFileSync(id, parsedJ);
                            } catch (e) {
                                var ir2: InsightResponse = {code: 400, body: {'error': 'cannot writefile'}};
                                reject(ir2);
                            }

                            var ir4: InsightResponse = {code: 204, body: {}};
                            fulfill(ir4);

                        }
                        return parsedJ
                    }).then(function(parsedJ){
                        if (fs.existsSync(id) && noOfFiles >  0 && filesNotJsonOrArrayOrHTMLCounter < noOfFiles) {
                            try {
                                fs.writeFileSync(id, parsedJ);
                            } catch (e) {
                                var ir2: InsightResponse = {code: 400, body: {'error': 'cannot writefile'}};
                                reject(ir2);
                            }

                            var ir4: InsightResponse = {code: 201, body: {}};
                            fulfill(ir4);
                        }

                    });
                })
                .catch(function (e: Error) {
                var ir2: InsightResponse = {code: 400, body: {'error':'it\'s not a zip file'}}; //error is in lower case
                reject(ir2);
            });
        });
    }

    setZoomToTagName(dataToZoom: any, destination:string): any {
        for (let ic in dataToZoom.childNodes) {
            if (!isUndefined(dataToZoom.childNodes[ic].tagName)) {
                if (dataToZoom.childNodes[ic].tagName == destination) {
                    return dataToZoom.childNodes[ic];
                }
            }
        }
    }

    //TODO: Get class from attrs array if (attrs[n].name == class), value =
    setZoomToClassOrId(dataToZoom: any, htmlClassOrId:string): any {
        for (let ic in dataToZoom.childNodes) {
            if (!isUndefined(dataToZoom.childNodes[ic].attrs) && dataToZoom.childNodes[ic].attrs instanceof Array) {
                for (let a in dataToZoom.childNodes[ic].attrs) {
                    if (dataToZoom.childNodes[ic].attrs[a].value.includes(htmlClassOrId)) {
                        return dataToZoom.childNodes[ic];
                    }
                }
            }
        }
    }
    scanRowForInfoWithoutChildNodes(row:any,valueToGet:string):any {
        for (let ic in row) {
            if (!isUndefined(row[ic].attrs) && row[ic].attrs instanceof Array) {
                for (let a in row[ic].attrs) {
                    if (row[ic].attrs[a].value.includes(valueToGet)) {
                        return row[ic].childNodes;
                    }
                }

            }
        }
    }

    getInnerAttrInsteadOfChildNode(row:any,valueToGet:string):any {
        for (let ic in row) {
            if (!isUndefined(row[ic].attrs) && row[ic].attrs instanceof Array) {
                for (let a in row[ic].attrs) {
                    if (row[ic].attrs[a].value.includes(valueToGet)) {
                        return row[ic].attrs;
                    }
                }

            }
        }
    }

    getLatLon(rooms_address:string):Promise<any> {
        return new Promise(function(fulfill,reject) {
            var latlonString = "";
            var http = require('http');
            try {
                var parse1 = http.get('http://skaha.cs.ubc.ca:11316/api/v1/team45/' + rooms_address, (res: any) => {
                    const statusCode = res.statusCode;
                    const contentType = res.headers['content-type'];

                    let error;
                    if (statusCode !== 200) {
                        error = new Error(`Request Failed.\n` +
                            `Status Code: ${statusCode}`);
                    } else if (!/^application\/json/.test(contentType)) {
                        error = new Error(`Invalid content-type.\n` +
                            `Expected application/json but received ${contentType}`);
                    }
                    if (error) {
                        console.log(error.message);
                        // consume response data to free up memory
                        res.resume();
                        return;
                    }

                    res.setEncoding('utf8');
                    try {
                        let rawData = '';
                        try {
                            res.on('data', (chunk: any) => rawData += chunk);
                        } catch (e) {
                            "Error is?" + e;
                        }
                        res.on('end', () => {
                            try {
                                let parsedData = JSON.parse(rawData);
                                let lat = parsedData.lat;
                                let lon = parsedData.lon;
                                latlonString = latlonString + lat;
                                latlonString = latlonString + lon;
                                console.log(parsedData);
                                console.log(lat);
                                console.log(lon);
                                Log.info("lat is:" + lat);
                                Log.info("lon is:" + lon);
                                fulfill(latlonString);
                            } catch (e) {
                                console.log(`problem with request: ${e.message}`);
                            }
                        });
                    } catch (e) {
                        Log.info("err is:" + e);
                    }

                }).on('error', (e: Error) => {
                    //console.log(`Got error: ${e.message}`);
                    Log.info("got error:" + e.message);

                });

                //var js = JSON.stringify(parse1);




            } catch (err) {
                Log.info("error is:" + err);
            }
        });
    }


    validStringListOfBuildings(isthis:any,shortNameList:string[],fullNameList:string[],addressList:string[],hrefList:string[]): any {
       // Log.info("it runs?");
        var fs = require('fs');
        var parse5 = require('parse5');
        var htmlData = parse5.parse(fs.readFileSync('index.htm',{encoding: 'utf8'}));
        var readyToBeZoomedInHtmlData;

        readyToBeZoomedInHtmlData = htmlData;
        readyToBeZoomedInHtmlData = isthis.setZoomToTagName(readyToBeZoomedInHtmlData, 'html');
        readyToBeZoomedInHtmlData = isthis.setZoomToTagName(readyToBeZoomedInHtmlData, 'body');
        readyToBeZoomedInHtmlData = isthis.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'full-width-container');
        readyToBeZoomedInHtmlData = isthis.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'main');
        readyToBeZoomedInHtmlData = isthis.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'content');
        readyToBeZoomedInHtmlData = isthis.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'block-system-main');
        readyToBeZoomedInHtmlData = isthis.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'view-buildings-and-classrooms');
        readyToBeZoomedInHtmlData = isthis.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'view-content');
        readyToBeZoomedInHtmlData = isthis.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'views-table');
        readyToBeZoomedInHtmlData = isthis.setZoomToTagName(readyToBeZoomedInHtmlData, 'tbody');

        //Log.info("it runs2?");
        for (let i in readyToBeZoomedInHtmlData.childNodes) {

                    for (let a in readyToBeZoomedInHtmlData.childNodes[i].attrs) {
                        if (readyToBeZoomedInHtmlData.childNodes[i].attrs[a].value.includes("odd")
                            || readyToBeZoomedInHtmlData.childNodes[i].attrs[a].value.includes("even")) {
                            var rowHtml = readyToBeZoomedInHtmlData.childNodes[i].childNodes;

                        //    Log.info("it runs3?");
                            var shortNameNode = isthis.scanRowForInfoWithoutChildNodes(rowHtml,"views-field-field-building-code");
                            var shortName = shortNameNode[0].value;
                            //try {shortName} catch(e) {Log.info("sth happened" + e);}
                            try {shortNameList.push(shortName);} catch(e) {Log.info("it is:" + e);}

                            var fullNameInitial = isthis.scanRowForInfoWithoutChildNodes(rowHtml,"views-field-title");
                            var fullNameNode = isthis.scanRowForInfoWithoutChildNodes(fullNameInitial,"Building Details and Map");
                            var fullName = fullNameNode[0].value;
                            fullNameList.push(fullName);

                            var addressNode = isthis.scanRowForInfoWithoutChildNodes(rowHtml,"views-field-field-building-address");
                            var address = addressNode[0].value;
                            addressList.push(address.replace(/^\s+|\s+$/g, ""));

                            var hrefInitial = isthis.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-nothing");
                            var hrefNode = isthis.getInnerAttrInsteadOfChildNode(hrefInitial, "./campus/discover/buildings-and-classrooms/");
                            //hardcode here:
                            hrefList.push(hrefNode[0].value.replace(/^\s+|\s+$/g, ""));

                            //accumString = accumString + "," + shortName + "," + fullName + "," + address; //array starts from A[1]
                        }
                    }
                }

        }

    //TODO: New function called GetPreciseData to eliminate bug due to hard-coding and varied data structure



    //TODO:store all the ids within the datafile instead of making a separate file to store the ids
    removeDataset(id: string): Promise<InsightResponse> {
        //by providing the id, remove the dataset
        //delete the zip file by id

        return new Promise(function (fulfill,reject) {
            //var request = require('request');
            var JSZip = require('jszip');
            var fs = require('fs');
            var zip = new JSZip();
            var data = '';

            if (fs.existsSync(id)) {
                //Log.info("before unlink");
                try {
                    fs.unlinkSync(id);
                } catch (e) {
                    Log.info(e);
                }
               // Log.info("after unlink");

                var ir4: InsightResponse = {code: 204, body: {}};
                fulfill(ir4);



            } else {
                var ir4: InsightResponse = {code: 404, body: {'error': 'delete was a resource that was not previously added'}};
                reject(ir4);
            }

        });
    }
    //Old Code from February 3rd


    /*addDataset(id: string, content: string): Promise<InsightResponse> {

        return new Promise(function (fulfill, reject) {

            var request = require('request');
            var JSZip = require('jszip');
            var fs = require('fs');
            var zip = new JSZip();
            var arrayOfId: string[] = [];
            var arrayOfUnparsedFileData: any = [];

            var filesNotJsonCounter = 0;
            var noOfFiles = 0;

            zip.loadAsync(content, {'base64': true}).then(function (zipasync: any) { //converts the content string to a JSZip object and loadasync makes everything become a promise


                zipasync.forEach(function (relativePath: any, file: any) {
                        if (!(/(.*)\/$/.test(file.name))) { //multi_courses/ VS multi_courses.zip  /(.\*)\//
                            var filecompressednoasync = file._data.compressedContent;
                            arrayOfUnparsedFileData.push(file.async("string"));
                        }
                    }
                );
                Promise.all(arrayOfUnparsedFileData).then(arrayofUnparsedFileDataAll => {
                    var arrayCounter = 0;
                    var parsedJSON = '';
                    var data = '';
                    var isTry = true;
                    for (let i in arrayofUnparsedFileDataAll) {
                        try {
                            isTry = true;
                            var x = String(arrayofUnparsedFileDataAll[i]);//JSON.stringify doesn't work
                            JSON.parse(x);//JSON.parse
                        }
                        catch (err) {
                            filesNotJsonCounter++;
                            isTry = false;
                            err;
                        }
                        noOfFiles++;

                        if (isTry) {
                            parsedJSON += String(arrayofUnparsedFileDataAll[i]) + "\r\n";//JSON.parse

                        }

                    }



                    if (noOfFiles == 0) {
                        var ir2: InsightResponse = {code: 400, body: {'Error': 'No datafile is found'}};
                        reject(ir2);
                    }

                    if (filesNotJsonCounter == noOfFiles) {
                        var ir2: InsightResponse = {code: 400, body: {'Error': 'Could not parse JSON'}};
                        reject(ir2);
                    }

                    if (noOfFiles != 0 && filesNotJsonCounter != noOfFiles) {
                        if (!fs.existsSync('existingIds_Don\'tMakeAnotherIdOfThisFileName')) {
                            fs.writeFile(id, parsedJSON, (err: Error) => {
                                if (err) throw err;
                            });//write data file
                            fs.writeFile('existingIds_Don\'tMakeAnotherIdOfThisFileName', id + "\r\n", (err: Error) => {
                                if (err) throw err;
                            }); //for new storage
                            var ir4: InsightResponse = {code: 204, body: {}};
                            fulfill(ir4);
                        }
                        else if (fs.existsSync('existingIds_Don\'tMakeAnotherIdOfThisFileName')) {
                            data = fs.readFileSync('existingIds_Don\'tMakeAnotherIdOfThisFileName').toString('utf8');
                            arrayOfId = data.split("\r\n");
                            if (!arrayOfId.includes(id)) {
                                {
                                    fs.writeFile(id, parsedJSON, (err: Error) => {
                                        if (err) throw err;
                                    });
                                    fs.writeFile('existingIds_Don\'tMakeAnotherIdOfThisFileName', id + "\r\n", (err: Error) => {
                                        if (err) throw err;
                                    });
                                    var ir4: InsightResponse = {code: 204, body: {}};
                                    fulfill(ir4);
                                }
                            }
                            else {
                                var count = 0;
                                for (let i in arrayOfId) {
                                    if (arrayOfId.includes(id)||fs.existsSync(id)) {
                                        //if id exists in arrayOfId
                                        // or id exists in the project folder
                                        count++;
                                        id = id + "(" + count + ")";
                                    }
                                }

                                fs.writeFile(id, parsedJSON, (err: Error) => {
                                    if (err) throw err;
                                });//datafile is written
                                data += id + "\r\n";
                                fs.writeFile('existingIds_Don\'tMakeAnotherIdOfThisFileName', data, (err: Error) => {
                                    if (err) throw err;
                                });
                                arrayOfId = [];
                                var ir4: InsightResponse = {code: 201, body: {}};
                                fulfill(ir4);
                            }
                        }
                    }
                });
            }).catch(function (e: any) {
                var ir2: InsightResponse = {code: 400, body: {e}};
                reject(ir2);
            });
        });
    }*/

    /*removeDataset(id: string): Promise<InsightResponse>
        //by providing the id, remove the dataset
        //delete the zip file by id

        return new Promise(function (fulfill,reject) {
            var request = require('request');
            var JSZip = require('jszip');
            var fs = require('fs');
            var zip = new JSZip();

            if (fs.existsSync(id)) {
                //zip.remove(id);
//DON'T use js zip, just use it for my own data structure and the ones I've created
                //correct the counter so that it conserves all the ids

                fs.unlinkSync(id);

                var ir4: InsightResponse = {code: 204, body: {}};
                fulfill(ir4);



            } else {
                var ir4: InsightResponse = {code: 400, body: {'Error': 'Delete was a resource that was not previously added'}};
                reject(ir4);
            }

        });
    }*/


    //TODO: if (<key> not found in UBCInsight) {return promise 400 body: {invalid <key>}}
    /*TODO: return a promise --> search in UBCInsight (this is hell lot easier man...)
    //TODO: Store each Query of UBCInsight into an arrayOfQuery (.split(\r\n))
    //TODO: If (contains(keyword) -> extract the value of the key)


    //TODO: Go into file and split through \r\n

    // if (match with the content within the file-->
     */
    performQuery(query: QueryRequest): Promise <InsightResponse> {
        //perform query
        var fs = require("fs");
        var queryCheck = this.isValid(query);
        var newThis = this;
        var yesOrNo = Object.keys(queryCheck)[0];
        var dataSetId = queryCheck[yesOrNo];

        return new Promise(function (resolve, reject) {
            if(yesOrNo == "true"){
                var filter = query.WHERE
                var columns = query.OPTIONS.COLUMNS;
                var order:any =  query.OPTIONS.ORDER;
                var table = query.OPTIONS.FORM;
                var keys = Object.keys(filter);
                var result = filter[keys[0]]; //value of the WHERE Filters
                var validKey;
                var contentDatasetResult;
                var datasetResultArray;
                //var cachedId = fs.readFileSync("existingIds_Don\'tMakeAnotherIdOfThisFileName").toString;
                //var cachedIdArray = cachedId.split("\r\n");
                //var nonExistIdArray = [];



                if(keys[0] == "AND" || keys[0] == "OR" || keys[0] == "NOT"){ //getting the corresponding id of dataset and reading it
                    var nonLogicFilter;
                    //console.time("testing get filter");
                    nonLogicFilter = newThis.getFilterArray(result);
                    //console.timeEnd("testing get filter")
                    if(nonLogicFilter instanceof Array) {
                        var nonLogicFilterVals = nonLogicFilter[0];
                        var nonLogicFilterKeys = Object.keys(nonLogicFilterVals);
                        var validTestKeyValue = nonLogicFilterVals[nonLogicFilterKeys[0]];
                        var validTestKeyArray = Object.keys(validTestKeyValue)
                        validKey = validTestKeyArray[0].split("_");


                        var testingResult = validKey[0]


                        // for future projects
                        /**for(let x in cachedIdArray){
                            if(validKey == cachedIdArray[x]){
                                contentDatasetResult = fs.readFileSync(validKey);
                            } else nonExistIdArray.push(validKey);
                        }*/

                        /**try {
                        contentDatasetResult = fs.readFileSync(validKey);
                    } catch (err) {
                        if (err.code === 'ENOENT') {
                            var code424InvalidQuery:InsightResponse = {code:424, body:{"missing":queryCheck}};
                            reject(code424InvalidQuery);

                        } else {
                            throw err;
                        }
                        // Here you get the error when the file was not found,
                        // but you also get any other error
                    } */
                        //console.time("testing read file AND OR")
                        try {
                            contentDatasetResult = fs.readFileSync(testingResult, "utf8")
                        }
                         catch(err){
                            if (err.code === 'ENOENT') {
                                var code424InvalidQuery:InsightResponse = {code:424, body:{"missing":dataSetId}};
                                return reject(code424InvalidQuery);

                            } else {
                                throw err;
                            }
                        }
                        //console.timeEnd("testing read file AND OR")

                    } else{ //this is for when keys[0] is NOT;
                        //var nonLogicFilterVals = result[0];

                        //var notKeys = Object.keys(nonLogicFilter);
                        //var notResult = nonLogicFilter[notKeys[0]];
                        //console.time("testing read file NOT")
                        var nonLogicFilterKeys = Object.keys(nonLogicFilter);
                        validKey = nonLogicFilterKeys[0].split("_");
                        var testingResult:string = validKey[0]
                        try {
                            contentDatasetResult = fs.readFileSync(testingResult, "utf8")
                        }
                        catch(err){
                            if (err.code === 'ENOENT') {
                                var code424InvalidQuery:InsightResponse = {code:424, body:{"missing":dataSetId}};
                                return (code424InvalidQuery);

                            } else {
                                throw err;
                            }
                        }

                        //console.timeEnd("testing read file NOT")
                }} /**else if(keys[0] == "NOT"){

                }*/
                else {

                    //var nonLogicFilterVals = result[0];
                    var nonLogicFilterKeys = Object.keys(result);
                    validKey = nonLogicFilterKeys[0].split("_");
                    var testingResult = validKey[0]
                        try {
                            //console.time("testing read file filters general")
                            contentDatasetResult = fs.readFileSync(testingResult, "utf8")
                            //console.timeEnd("testing read file filters general")

                        }
                        catch(err){
                            if (err.code === 'ENOENT') {
                                var code424InvalidQuery:InsightResponse = {code:424, body:{"missing":dataSetId}};
                                return reject(code424InvalidQuery);

                            } else {
                                throw err;
                            }
                        }

                }
                //console.time("parse through extracted content")
                datasetResultArray = contentDatasetResult.split("\r\n")
                //console.timeEnd("parse through extracted content")
                // TODO: sort result Info


                // example empty result {"result":[],"rank":0}
                // example valid result {"result":[section1, section2, etc...], "rank":0}

                if(datasetResultArray.length > 0) {
                    var lmaoWeDone;
                    var finalReturn = [];
                    var returnInfo:any = {};
                    var atomicReturnInfo:any; //building block of query's return based on valid Keys
                    //console.time("go through datasetResultArray overall")
                    for (let x in datasetResultArray) { //iterates through the array of results, now just a result
                        /**if(Number(x) >= 935){
                            Log.info("start debug")
                        }*/
                        //Log.info(x)
                        if(datasetResultArray[x] == false){
                            Log.info("skip this white space")
                        }else {
                            var singleCourse = JSON.parse(datasetResultArray[x]);
                            var sectionArray;
                            var singleSection;
                            var singleColumnKey;
                            var translatedKey; //translated key from query into the corresponding one into dataSet

                            sectionArray = singleCourse["result"]
                            if (isUndefined(sectionArray)) {
                                sectionArray = [];
                                /**var code400InvalidQuery: InsightResponse = {
                                    code: 400,
                                    body: {"error": "malformed dataset with no result in array"}
                                };
                                reject(code400InvalidQuery);*/
                            } else {
                                if (sectionArray instanceof Array && sectionArray.length > 0) { //going into the arrays of sections and organizing them based on the OPTIONS
                                    //console.time("one course")
                                    for (let x in sectionArray) {
                                        singleSection = sectionArray[x]
                                        /**if(Number(x) == 6){
                                            Log.info("continue debug")
                                        }*/
                                        for(var sectionValidKey in singleSection) {
                                            if(!singleSection.hasOwnProperty(sectionValidKey)){
                                                continue;
                                            }

                                            translatedKey = newThis.vocabDataBase(sectionValidKey)
                                            if(translatedKey == false){
                                                translatedKey = translatedKey
                                            }   else if(translatedKey == true) {
                                                translatedKey = translatedKey
                                            }else {
                                                if(translatedKey == "courses_uuid" && typeof singleSection[sectionValidKey] == "number"){
                                                    var uuid = singleSection[sectionValidKey];
                                                    var stringUuid = uuid.toString();

                                                    if (isUndefined(uuid)) {
                                                        var code400InvalidQuery: InsightResponse = {
                                                            code: 400,
                                                            body: {"error": "malformed dataset with no key in result"}
                                                        };
                                                        return reject(code400InvalidQuery);
                                                    } else {
                                                        atomicReturnInfo = {[translatedKey]:stringUuid}

                                                        returnInfo = Object.assign({}, returnInfo, atomicReturnInfo);
                                                        //Log.info(returnInfo);

                                                        //should look like {"courses_avg":95, "courses_instructor":"bleh"}
                                                    }
                                                }else {
                                                    atomicReturnInfo = {[translatedKey]: singleSection[sectionValidKey]}
                                                    if (isUndefined(singleSection[sectionValidKey])) {
                                                        var code400InvalidQuery: InsightResponse = {
                                                            code: 400,
                                                            body: {"error": "malformed dataset with no key in result"}
                                                        };
                                                        return reject(code400InvalidQuery);
                                                    } else {


                                                        returnInfo = Object.assign({}, returnInfo, atomicReturnInfo);
                                                        //Log.info(returnInfo);

                                                        //should look like {"courses_avg":95, "courses_instructor":"bleh"}
                                                    }
                                                }
                                            }
                                        }returnInfo = newThis.filterQueryRequest(returnInfo, result, keys)
                                        //Log.info(returnInfo);
                                        if(returnInfo.length == 0){
                                            returnInfo = returnInfo
                                        }else {
                                            var cachedReturnInfo;
                                            //returnInfo = {}
                                            for (let x in columns) {
                                                singleColumnKey = columns[x].toString()


                                                //translatedKey = newThis.vocabValidKey(singleColumnKey);
                                                /**if(translatedKey == false){
                                                    var code400InvalidQuery:InsightResponse = {code:400, body:{"error":"malformed key"}};
                                                    reject(code400InvalidQuery);
                                                }   else if(translatedKey == true) {
                                                    continue;
                                                }else{*/

                                                    if(returnInfo.hasOwnProperty(singleColumnKey)){
                                                        /**if(Number(x) == 0){
                                                            returnInfo = {};
                                                        }*/


                                                        cachedReturnInfo = Object.assign({}, cachedReturnInfo, {[singleColumnKey]: returnInfo[singleColumnKey]});
                                                    } else
                                                    if (isUndefined(returnInfo[singleColumnKey])) {
                                                        var code400InvalidQuery: InsightResponse = {
                                                            code: 400,
                                                            body: {"error": "malformed dataset with no key in result"}
                                                        };
                                                        return reject(code400InvalidQuery);
                                                    } else {

                                                        returnInfo = returnInfo
                                                        //returnInfo = Object.assign({}, returnInfo, atomicReturnInfo);
                                                        //Log.info(returnInfo);

                                                        //should look like {"courses_avg":95, "courses_instructor":"bleh"]
                                                    }
                                                //}
                                                /**if(result instanceof Array && result.length == 0){
                                                result = result[0]
                                            }*/
                                            }
                                            finalReturn.push(cachedReturnInfo);
                                        }


                                    } //console.timeEnd("one course")



                                } else if(sectionArray instanceof Array && sectionArray.length ==0){
                                    sectionArray = sectionArray
                                    /**var code400InvalidQuery: InsightResponse = {
                                        code: 400,
                                        body: {"error": "malformed dataset with empty result in array"}
                                    };
                                    reject(code400InvalidQuery);*/
                                } else{
                                    var code400InvalidQuery: InsightResponse = {
                                        code: 400,
                                        body: {"error": "malformed dataset with empty result in array"}
                                    };
                                    return reject(code400InvalidQuery)
                                }

                                // TODO: then get the WHERE to decide which ones to keep

                            }
                        }
                    } //console.timeEnd("go through datasetResultArray overall")
                    // TODO: sort using order last

                    //console.time("sort through result")
                    if(!(isUndefined(order))) {
                        if (columns.includes(order)) {
                            if (order.endsWith("_avg") || order.endsWith("_pass") || order.endsWith("_fail") || order.endsWith("_audit") || order.endsWith("_year")) {

                                finalReturn = finalReturn.sort(function (a, b) {
                                    return a[order] - b[order];
                                });

                            } else if (order.endsWith("_dept") || order.endsWith("_id") || order.endsWith("_instructor")) {
                                finalReturn = finalReturn.sort(function (a, b) {
                                    var nameA = a[order].toUpperCase(); // ignore upper and lowercase
                                    var nameB = b[order].toUpperCase(); // ignore upper and lowercase
                                    if (nameA < nameB) {
                                        return -1;
                                    } else if (nameA > nameB) {
                                        return 1;
                                    } else
                                        return 0;
                                });


                            } else if (order.endsWith("_uuid")) {
                                finalReturn = finalReturn.sort(function (a, b) {
                                    var numA = Number(a[order]); // ignore upper and lowercase
                                    var numB = Number(b[order]); // ignore upper and lowercase
                                    /**if (nameA < nameB) {
                                    return -1;
                                } else if (nameA > nameB) {
                                    return 1;
                                } else
                                     return 0;*/
                                    return numA - numB;
                                });


                            } else {
                                var code400InvalidQuery: InsightResponse = {code: 400, body: {"error": "order error"}};
                                reject(code400InvalidQuery);
                            }
                        } else {
                            var code400InvalidQuery: InsightResponse = {
                                code: 400,
                                body: {"error": "order not in column"}
                            };
                            return reject(code400InvalidQuery);
                        }
                        //console.timeEnd("sort through result")
                    }

                    // TODO: then enclose it with {render:"TABLE", result:[{returnInfo}, {data4}]}

                        lmaoWeDone = {render: table, result: finalReturn}

                        var code200Done: InsightResponse = {code: 200, body: lmaoWeDone}
                        return resolve(code200Done);





                } else{
                    var code400InvalidQuery:InsightResponse = {code:400, body:{"error":"empty dataset"}};
                    return reject(code400InvalidQuery);
                }




            } else if(yesOrNo == "false"){
                var code424InvalidQuery:InsightResponse = {code:424, body:{'missing':dataSetId}};
                return reject(code424InvalidQuery);

            }
                else{
                var code400InvalidQuery:InsightResponse = {code:400, body:{"error":"invalid query"}};
                return reject(code400InvalidQuery);
            }
        });

        }

        //perform query


    //Helper function in main queryRequest()
    getFilterArray(logicFilter:any):any{
        if(logicFilter instanceof Array) {

            var firstFilter = logicFilter[0];
            var keys = Object.keys(firstFilter);
            var innerResult = firstFilter[keys[0]];


            if(keys[0] == "AND" || keys[0] == "OR" || keys[0] == "NOT"){
                innerResult = this.getFilterArray(innerResult);
                return innerResult;
            } else
                return innerResult;

        } else {

            var keys = Object.keys(logicFilter);
            var innerResult = logicFilter[keys[0]];

            if (keys[0] == "AND" || keys[0] == "OR") {
                this.getFilterArray(innerResult);
                return innerResult;
            } else if(keys[0] == "NOT"){

                innerResult = this.getFilterArray(innerResult);
                var innerResultKey = Object.keys(innerResult)
                var innerResultValue = innerResult[innerResultKey[0]]
                return innerResult;
            } else return innerResult;
        }

    }
    /** courses_dept: string; The department that offered the course. = "Subject"
     ** courses_id: string; The course number (will be treated as a string (e.g., 499b)). = "Course":"numberstring"
     ** courses_avg: number; The average of the course offering. = "Avg":number
     ** courses_instructor: string; The instructor teaching the course offering. = "Professor":"lastname, firstname"
     ** courses_title: string; The name of the course. = "Title"
     ** courses_pass: number; The number of students that passed the course offering. = "Pass"
     ** courses_fail: number; The number of students that failed the course offering. = "Fail"
     ** courses_audit: number; The number of students that audited the course offering. = "Audit"
     ** courses_uuid: string; The unique id of a course offering. = "id"
     */
    //vocabValidKey(validKey:string):string|boolean

    vocabDataBase(databaseKey:string):string|boolean{
        if(databaseKey == "Subject"){
            return "courses_dept"
        } else if(databaseKey == "Course"){
            return "courses_id"
        } else if(databaseKey == "Avg"){
            return "courses_avg"
        } else if(databaseKey == "Professor"){
            return "courses_instructor"
        } else if(databaseKey == "Title"){
            return "courses_title"
        } else if(databaseKey == "Pass"){
            return "courses_pass"
        } else if(databaseKey == "Fail"){
            return "courses_fail"
        } else if(databaseKey == "Audit"){
            return "courses_audit"
        } else if(databaseKey == "id"){
            return "courses_uuid"
        } else if(databaseKey == "Year"){
            return "courses_year"
        } else return false;
    }

    filterQueryRequest(returnInfo:any, resultOfWhere:any, keys:any):any{
        //returnInfo is now {atomicReturnInfo, atomicReturnInfo...}


        var sortVal:any;
        var resultKeyArray:any = Object.keys(resultOfWhere);
        var sortKey = resultOfWhere[resultKeyArray[0]];
        sortVal = resultOfWhere[resultKeyArray[0]];
        if(keys[0] == "LT"){

            returnInfo = this.isLessThan(returnInfo, resultKeyArray, keys, sortVal);
            return returnInfo;

        }else if(keys[0] == "GT"){

            returnInfo = this.isGreaterThan(returnInfo, resultKeyArray, keys, sortVal);
            return returnInfo;

        }else if(keys[0] == "EQ"){

            returnInfo = this.isEqualTo(returnInfo, resultKeyArray, keys, sortVal);
            return returnInfo;
        }else if(keys[0] == "AND"){
            //console.time("Go through AND")
            var newFilter;
            var newKeys;
            var newResult;
            var tempReturnInfo
            for(let x in resultOfWhere){
                if(Number(x) == 0){
                    newFilter = resultOfWhere[x];
                    newKeys = Object.keys(newFilter);
                    newResult = newFilter[newKeys[0]];

                }else {
                    returnInfo = this.filterQueryRequest(returnInfo, newResult, newKeys);
                    newFilter = resultOfWhere[x];
                    newKeys = Object.keys(newFilter);
                    newResult = newFilter[newKeys[0]];


                    returnInfo = this.filterQueryRequest(returnInfo, newResult, newKeys);
                }

            }//console.timeEnd("Go through AND")
            return returnInfo

        }else if(keys[0] == "OR"){
            //console.time("Go through OR")

            var newFilter;
            var newKeys;
            var newResult;
            var tempReturnInfo;
            var tempReturnInfo2;

            for(let x in resultOfWhere){

                if(Number(x) == 0){
                    newFilter = resultOfWhere[x];
                    newKeys = Object.keys(newFilter);
                    newResult = newFilter[newKeys[0]];
                    tempReturnInfo = this.filterQueryRequest(returnInfo, newResult, newKeys);
                }else {
                    tempReturnInfo = this.filterQueryRequest(returnInfo, newResult, newKeys);
                    newFilter = resultOfWhere[x];
                    newKeys = Object.keys(newFilter);
                    newResult = newFilter[newKeys[0]];
                    tempReturnInfo2 = this.filterQueryRequest(returnInfo, newResult, newKeys);
                    if(tempReturnInfo2.length == 0){
                        returnInfo = tempReturnInfo;
                    }else if(tempReturnInfo.length == 0){
                        returnInfo = tempReturnInfo2;
                    }else {
                        returnInfo = this.mergeDeDuplicate(tempReturnInfo2, tempReturnInfo);
                    }

                }
            }//console.timeEnd("Go through OR")
            return returnInfo

        }else if(keys[0] == "NOT"){

            var newFilter;
            var newKeys;
            var newResult;
            var tempReturnInfo;
            var tempReturnInfo2;

            var tempSortKey = Object.keys(sortKey)
            //sortKey = sortKey[tempSortKey[0]]
            //console.time("Go through NOT")
            newKeys = Object.keys(resultOfWhere);
            newResult = resultOfWhere[newKeys[0]];

            tempReturnInfo = this.filterQueryRequest(returnInfo, newResult, newKeys);
            tempReturnInfo2 = returnInfo;


            if(tempSortKey[0] == "GT" || tempSortKey[0] == "LT" || tempSortKey[0] == "EQ" || tempSortKey[0] == "IS"){
                sortKey = sortKey[tempSortKey[0]]
            } else if(tempSortKey[0] == "NOT"){
                sortKey = this.getFilterArray(resultOfWhere);
            }

                returnInfo = this.isNOT(returnInfo, tempReturnInfo, sortKey, resultKeyArray);

            //console.timeEnd("Go through NOT")
            return returnInfo
        }else if(keys[0] == "IS"){

            returnInfo = this.isIsLOL(returnInfo, resultKeyArray, keys, sortVal);
            return returnInfo;
        }
        else return null
    }

    mergeDeDuplicate(theWaitingKeyValue:any, theIteratedKeyValue:any):any{
        var theIteratedKeyArray = Object.keys(theIteratedKeyValue)
        for(let x in theIteratedKeyArray){
            var theIteratedKey = theIteratedKeyArray[x];
            var theIteratedValue = theIteratedKeyValue[theIteratedKey];
            if(theWaitingKeyValue.hasOwnProperty(theIteratedKey) && theWaitingKeyValue[theIteratedKey] == theIteratedValue){
                //Log.info("merging duplicates"+theWaitingKeyValue.toString()+theIteratedKeyValue.toString())
            } else {
                theWaitingKeyValue.assign({}, {[theIteratedKey]:theIteratedValue});
            }

        } return theWaitingKeyValue
    }

    isLessThan(returnInfo:any, resultKeyArray:any, keys:string[], sortVal:any){
        //resultKeyArray[0] is basically "courses_avg"
        //returnInfo is now {atomicReturnInfo, atomicReturnInfo}
        var sortKey = resultKeyArray[0]
        var returnInfoKeyArray = Object.keys(returnInfo);
        for(let x in returnInfoKeyArray){
            var tempAtomicKey = returnInfoKeyArray[x]
            var tempAtomicValue = returnInfo[tempAtomicKey];
            if(isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue < sortVal && sortKey == tempAtomicKey){
                returnInfo = returnInfo
            } else if(isNumber(sortVal) && isNumber(tempAtomicValue) && sortKey == tempAtomicKey){
                returnInfo = [] //TODO: Possible error HERE!!!
            } else{
                returnInfo = returnInfo //TODO: Possible error HERE!!!
            }
        }return returnInfo;
    }

    isGreaterThan(returnInfo:any, resultKeyArray:any, keys:string[], sortVal:any){

        //resultKeyArray[0] is basically "courses_avg"
        //returnInfo is now {atomicReturnInfo, atomicReturnInfo}
        var sortKey = resultKeyArray[0]
        var returnInfoKeyArray = Object.keys(returnInfo);
        for(let x in returnInfoKeyArray){
            var tempAtomicKey = returnInfoKeyArray[x]
            var tempAtomicValue = returnInfo[tempAtomicKey];
            if(isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue > sortVal && sortKey == tempAtomicKey){
                returnInfo = returnInfo
            } else if(isNumber(sortVal) && isNumber(tempAtomicValue) && sortKey == tempAtomicKey){
                returnInfo = [] //TODO: Possible error HERE!!!
            } else{returnInfo = returnInfo}
        }return returnInfo;
    }

    isEqualTo(returnInfo:any, resultKeyArray:any, keys:string[], sortVal:any) {
        //resultKeyArray[0] is basically "courses_avg"
        //returnInfo is now {atomicReturnInfo, atomicReturnInfo}
        var sortKey = resultKeyArray[0]
        var returnInfoKeyArray = Object.keys(returnInfo);
        for (let x in returnInfoKeyArray) {
            var tempAtomicKey = returnInfoKeyArray[x]
            var tempAtomicValue = returnInfo[tempAtomicKey];
            if (isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue == sortVal && sortKey == tempAtomicKey) {
                returnInfo = returnInfo
            } else if(isNumber(sortVal) && isNumber(tempAtomicValue) && sortKey == tempAtomicKey){
                returnInfo = [] //TODO: Possible error HERE!!!
            } else {
                returnInfo = returnInfo //TODO: Possible error HERE!!!
            }
        }
        return returnInfo;//resultKeyArray[0] is basically "courses_avg"
    }


    isIsLOL(returnInfo:any, resultKeyArray:any, keys:string[], sortVal:string){
        //resultKeyArray[0] is basically "courses_avg"
        //returnInfo is now {atomicReturnInfo, atomicReturnInfo}
        var returnInfoKeyArray = Object.keys(returnInfo);
        var sortKey = resultKeyArray[0]
        for(let x in returnInfoKeyArray){
            var tempAtomicKey = returnInfoKeyArray[x]
            var tempAtomicValue = returnInfo[tempAtomicKey];
            if(isString(sortVal) && isString(tempAtomicValue) &&
                ((sortVal.startsWith("*") && sortVal.endsWith("*") && tempAtomicValue.includes(sortVal.slice(1, sortVal.length - 1).toString())) ||
                (sortVal.startsWith("*") && !(sortVal.endsWith("*")) && tempAtomicValue.endsWith(sortVal.slice(1).toString())) ||
                (!(sortVal.startsWith("*")) && sortVal.endsWith("*") && tempAtomicValue.startsWith(sortVal.slice(0, sortVal.length - 1).toString())))
                && sortKey == tempAtomicKey){
                returnInfo = returnInfo
            } else if(isString(sortVal) && tempAtomicValue == sortVal && sortKey == tempAtomicKey){
                tempAtomicValue = tempAtomicValue
            } else if(isString(sortVal) && sortKey == tempAtomicKey){
                returnInfo = [] //TODO: Possible error HERE!!!
            } else{
                returnInfo = returnInfo
            }
        }return returnInfo;

    }

    isNOT(returnInfo:any, tempReturnInfo:any, sortKey:any, resultKeyArray:any){
        if(tempReturnInfo.length == 0){
            return returnInfo
        }else {
            var tempReturnInfoKeyArray = Object.keys(tempReturnInfo)
            sortKey = Object.keys(sortKey)[0]
            for (let x in tempReturnInfoKeyArray) { //removes all subsequent filter results
                var tempAtomicKey = tempReturnInfoKeyArray[x];
                var tempAtomicVal = tempReturnInfo[tempAtomicKey]
                    ;
                var temp = tempAtomicKey.toString()
                var temp2 = returnInfo[temp];
                var bool = returnInfo.hasOwnProperty(tempAtomicKey);
                if (returnInfo.hasOwnProperty(tempAtomicKey) && returnInfo[tempAtomicKey] == tempAtomicVal && tempAtomicKey == sortKey) {
                    returnInfo = [];
                } else {
                    returnInfo = returnInfo;
                }
            }
            return returnInfo;
        }
    }

    //Help Functions For querychecking
    isValid(query:QueryRequest):any{
        //checks for query provided is of valid syntax
        var keyArray = Object.keys(query); //an array of the keys, should only be WHERE and OPTIONS now
        var Where    //returns WHERE
        var Options; //returns OPTIONS
        var filter;  //returns value of FILTER
        var optionsValue; //returns value of OPTIONS
        var columnsEtcKey; //returns values including and after COLUMNS
        var columnsValidKeyArray; //returns the array of Valid Keys assigned to COLUMNS
        var orderValidKey; //returns the single valid key assigned to ORDER
        var Table; //returns TABLE from VIEW
        var invalidIdArray = new Array; //returns an array of id in query that do not exist
        var invalidIdLists;
        var isOneDataset:any = {"true":invalidIdArray}; //{boolean:invalidDataset[]}
        if(keyArray[0] == "WHERE" && keyArray[1] == "OPTIONS"){ //checks if outermost keys are WHERE and OPTIONS

                Where = keyArray[0]; //gets "WHERE"
                Options = keyArray[1]; //gets"OPTIONS"
                filter = query[Where]; //returns content of FILTER

                isOneDataset = this.hasFilter(filter, invalidIdArray, isOneDataset);
                var yesOrNo = Object.keys(isOneDataset)[0];
                var dataSet = isOneDataset[yesOrNo];
                if(isOneDataset != false) { //check if FILTER is valid, needed as FILTER is recursively nested && invalidIdArray.length == 0
                    optionsValue = query[Options]; //gets all values from OPTIONS
                    columnsEtcKey = Object.keys(optionsValue); //gets all the "key" within the value from OPTIONS, such as COLUMNS and etc...
                    if((columnsEtcKey.length == 3 && columnsEtcKey[0] == "COLUMNS" && columnsEtcKey[1] == "ORDER" && columnsEtcKey[2] == "FORM") ||
                        (columnsEtcKey.length == 2 && columnsEtcKey[0] == "COLUMNS" && columnsEtcKey[1] == "FORM")){
                        columnsValidKeyArray = optionsValue[columnsEtcKey[0]] //returns an a possible array of valid keys in COLUMNS
                        for(let x in columnsValidKeyArray){
                            if(typeof columnsValidKeyArray[x] == "string" && (columnsValidKeyArray[x] == "courses_dept" || columnsValidKeyArray[x] == "courses_id"
                                || columnsValidKeyArray[x] == "courses_avg" || columnsValidKeyArray[x] == "courses_instructor"
                                || columnsValidKeyArray[x] == "courses_title" || columnsValidKeyArray[x] == "courses_pass"
                                || columnsValidKeyArray[x] == "courses_fail" || columnsValidKeyArray[x] == "courses_audit"
                                || columnsValidKeyArray[x] == "courses_uuid" || columnsValidKeyArray[x] == "courses_year")){ //checks for valid keys
                                if(yesOrNo == "true" && (dataSet[0] == "courses" || dataSet.length == 0)) {
                                    isOneDataset = {"true":["courses"]} //dummy line of code so further check would be done outside of for-loop
                                } else if(yesOrNo == "true" && (dataSet[0] != "courses")){
                                    var invalidIdLists = columnsValidKeyArray[x].split("_");

                                    if(invalidIdArray.includes(invalidIdLists[0])){
                                        invalidIdLists = [];
                                    } else {
                                        invalidIdArray.push(invalidIdLists[0]);
                                    }
                                    isOneDataset = {"false":invalidIdArray}
                                    //return isOneDataset;

                                } else continue;
                            } else if(typeof columnsValidKeyArray[x] == "string" && (columnsValidKeyArray[x] == "rooms_fullname" || columnsValidKeyArray[x] == "rooms_shortname"
                                || columnsValidKeyArray[x] == "rooms_shortname" || columnsValidKeyArray[x] == "rooms_number"
                                || columnsValidKeyArray[x] == "rooms_name" || columnsValidKeyArray[x] == "rooms_address"
                                || columnsValidKeyArray[x] == "rooms_lat" || columnsValidKeyArray[x] == "rooms_lon"
                                || columnsValidKeyArray[x] == "rooms_seats" || columnsValidKeyArray[x] == "rooms_type" || columnsValidKeyArray[x] == "rooms_furniture"
                                || columnsValidKeyArray[x] == "rooms_href")){ //checks for valid keys
                                if(yesOrNo == "true" && (dataSet[0] == "rooms" || dataSet.length == 0)) {
                                    isOneDataset = {"true":["rooms"]} //dummy line of code so further check would be done outside of for-loop
                                } else if(yesOrNo == "true" && (dataSet[0] != "rooms")){
                                    var invalidIdLists = columnsValidKeyArray[x].split("_");

                                    if(invalidIdArray.includes(invalidIdLists[0])){
                                        invalidIdLists = [];
                                    } else {
                                        invalidIdArray.push(invalidIdLists[0]);
                                    }
                                    isOneDataset = {"false":invalidIdArray}
                                    //return isOneDataset;

                                } else continue;
                            } else if(typeof columnsValidKeyArray[x] == "string" && !(columnsValidKeyArray[x].startsWith("courses")) && (this.occurrences(columnsValidKeyArray[x], "_", true)) == 1&&
                                (columnsValidKeyArray[x].endsWith("_dept") || columnsValidKeyArray[x].endsWith("_id") || columnsValidKeyArray[x].endsWith("_avg") ||
                                columnsValidKeyArray[x].endsWith("_instructor") || columnsValidKeyArray[x].endsWith("_title") || columnsValidKeyArray[x].endsWith("_pass") ||
                                columnsValidKeyArray[x].endsWith("_fail") || columnsValidKeyArray[x].endsWith("_audit") || columnsValidKeyArray[x].endsWith("_uuid")
                                || columnsValidKeyArray[x].endsWith("_years"))){

                                invalidIdLists = columnsValidKeyArray[x].split("_");


                                if(invalidIdArray.includes(invalidIdLists[0])){
                                    invalidIdLists = [];
                                } else {
                                    invalidIdArray.push(invalidIdLists[0]);
                                }isOneDataset = {"false":invalidIdArray}

                            }else if(typeof columnsValidKeyArray[x] == "string" && !(columnsValidKeyArray[x].startsWith("rooms")) && (this.occurrences(columnsValidKeyArray[x], "_", true)) == 1&&
                                (columnsValidKeyArray[x].endsWith("_fullname") || columnsValidKeyArray[x].endsWith("_shortname") || columnsValidKeyArray[x].endsWith("_number") ||
                                columnsValidKeyArray[x].endsWith("_name") || columnsValidKeyArray[x].endsWith("_address") || columnsValidKeyArray[x].endsWith("_lat") ||
                                columnsValidKeyArray[x].endsWith("_lon") || columnsValidKeyArray[x].endsWith("_seats") || columnsValidKeyArray[x].endsWith("_type")
                                || columnsValidKeyArray[x].endsWith("_furniture") || columnsValidKeyArray[x].endsWith("_href"))){

                                invalidIdLists = columnsValidKeyArray[x].split("_");


                                if(invalidIdArray.includes(invalidIdLists[0])){
                                    invalidIdLists = [];
                                } else {
                                    invalidIdArray.push(invalidIdLists[0]);
                                }isOneDataset = {"false":invalidIdArray}

                            }else if(typeof columnsValidKeyArray[x] == "string" && (!(columnsValidKeyArray[x].startsWith("courses") && !(columnsValidKeyArray[x].startsWith("rooms"))) && columnsValidKeyArray[x].includes("_"))){

                                invalidIdLists = columnsValidKeyArray[x].split("_");


                                if(invalidIdArray.includes(invalidIdLists[0])){
                                    invalidIdLists = [];
                                } else {
                                    invalidIdArray.push(invalidIdLists[0]);
                                }isOneDataset = {"false":invalidIdArray}

                            }else
                                return false
                        } if(columnsEtcKey[1] == "ORDER") {
                            orderValidKey = optionsValue[columnsEtcKey[1]];//gets ORDER key
                            if (columnsValidKeyArray.includes(orderValidKey)) {
                                if (orderValidKey == "courses_dept" || orderValidKey == "courses_id"
                                    || orderValidKey == "courses_avg" || orderValidKey == "courses_instructor"
                                    || orderValidKey == "courses_title" || orderValidKey == "courses_pass"
                                    || orderValidKey == "courses_fail" || orderValidKey == "courses_audit"
                                    || orderValidKey == "courses_uuid" || orderValidKey == "courses_year") { //checks for valid key
                                    if(yesOrNo == "true" && (dataSet[0] == "courses" || dataSet.length == 0)) {
                                        Table = optionsValue[columnsEtcKey[2]];
                                        if (Table == "TABLE") { //if value of FORM is TABLE
                                            isOneDataset = {"true":["courses"]}
                                            return isOneDataset
                                        } else return false;

                                    } else if(yesOrNo == "true" && (dataSet[0] != "courses")){
                                        var invalidIdLists = orderValidKey.split("_");

                                        if(invalidIdArray.includes(invalidIdLists[0])){
                                            invalidIdLists = [];
                                        } else {
                                            invalidIdArray.push(invalidIdLists[0]);
                                        }
                                        isOneDataset = {"false":invalidIdArray}
                                        return isOneDataset;

                                    } return isOneDataset;
                                } else if (orderValidKey == "rooms_fullname" || orderValidKey == "rooms_shortname"
                                    || orderValidKey == "rooms_number" || orderValidKey == "rooms_name"
                                    || orderValidKey == "rooms_address" || orderValidKey == "rooms_lat"
                                    || orderValidKey == "rooms_lon" || orderValidKey == "rooms_seats"
                                    || orderValidKey == "rooms_type" || orderValidKey == "rooms_href" || orderValidKey == "rooms_furniture") { //checks for valid key
                                    if(yesOrNo == "true" && (dataSet[0] == "roomss" || dataSet.length == 0)) {
                                        Table = optionsValue[columnsEtcKey[2]];
                                        if (Table == "TABLE") { //if value of FORM is TABLE
                                            isOneDataset = {"true":["rooms"]}
                                            return isOneDataset
                                        } else return false;

                                    } else if(yesOrNo == "true" && (dataSet[0] != "rooms")){
                                        var invalidIdLists = orderValidKey.split("_");

                                        if(invalidIdArray.includes(invalidIdLists[0])){
                                            invalidIdLists = [];
                                        } else {
                                            invalidIdArray.push(invalidIdLists[0]);
                                        }
                                        isOneDataset = {"false":invalidIdArray}
                                        return isOneDataset;

                                    } return isOneDataset;

                                } else if (typeof orderValidKey == "string" && (this.occurrences(orderValidKey, "_", true)) == 1 && !(orderValidKey.startsWith("courses")) &&
                                    (orderValidKey.endsWith("_dept") || orderValidKey.endsWith("_id") || orderValidKey.endsWith("_avg") ||
                                    orderValidKey.endsWith("_instructor") || orderValidKey.endsWith("_title") || orderValidKey.endsWith("_pass") ||
                                    orderValidKey.endsWith("_fail") || orderValidKey.endsWith("_audit") || orderValidKey.endsWith("_uuid") || orderValidKey.endsWith("_year"))) {

                                    invalidIdLists = orderValidKey.split("_");

                                    if (invalidIdArray.includes(invalidIdLists[0])) {
                                        invalidIdLists = [];
                                    } else {
                                        invalidIdArray.push(invalidIdLists[0]);
                                    }
                                    isOneDataset = {"false":invalidIdArray}
                                    return isOneDataset;
                                } else if (typeof orderValidKey == "string" && (this.occurrences(orderValidKey, "_", true)) == 1 && !(orderValidKey.startsWith("rooms")) &&
                                    (orderValidKey.endsWith("_fullname") || orderValidKey.endsWith("_shortname") || orderValidKey.endsWith("_number") ||
                                    orderValidKey.endsWith("_name") || orderValidKey.endsWith("_address") || orderValidKey.endsWith("_lat") ||
                                    orderValidKey.endsWith("_lon") || orderValidKey.endsWith("_seats") || orderValidKey.endsWith("_type") || orderValidKey.endsWith("_furniture")
                                    || orderValidKey.endsWith("_href"))) {

                                    invalidIdLists = orderValidKey.split("_");

                                    if (invalidIdArray.includes(invalidIdLists[0])) {
                                        invalidIdLists = [];
                                    } else {
                                        invalidIdArray.push(invalidIdLists[0]);
                                    }
                                    isOneDataset = {"false":invalidIdArray}
                                    return isOneDataset;
                                } else if (typeof orderValidKey == "string" && (!(orderValidKey.startsWith("courses") && !(orderValidKey.startsWith("rooms"))) && orderValidKey.includes("_"))) {

                                    invalidIdLists = orderValidKey.split("_");

                                    if (invalidIdArray.includes(invalidIdLists[0])) {
                                        invalidIdLists = [];
                                    } else {
                                        invalidIdArray.push(invalidIdLists[0]);
                                    }
                                    isOneDataset = {"false":invalidIdArray}
                                    return isOneDataset;
                                } else return false
                            } else return false
                        } else { Table = optionsValue[columnsEtcKey[1]];
                            if (Table == "TABLE") { //if value of FORM is TABLE
                                return isOneDataset;
                            } else return false;
                        }
                    } else return false;
                } else if(invalidIdArray.length > 0){
                    Log.error(typeof invalidIdArray)
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset
                }else return false;


        }else return false;
    }

    hasFilter(filter:FilterQuery, invalidIdArray:any, isOneDataset:any):any{ //
        var comparisonKey = Object.keys(filter); //gets first comparator from FILTER
        var comparisonValue = filter[comparisonKey[0]] //gets value from each FILTER
        var validProjectKey; //gets valid key e.g. courses_dept
        var mComparisonNumber; //gets value number from MComparison key/value pair
        var sComparisonString; //gets value string from SComparison key/value pair
        if(comparisonKey.length == 1){ //checks that there is only one comparator

            if(comparisonKey[0] == "AND" || comparisonKey[0] == "OR"){
                isOneDataset = this.hasArrayFilter(comparisonValue, invalidIdArray, isOneDataset)
                if(isOneDataset != false){ //anything that isn't a false (meaning error) passes)
                    Log.test("true")
                    return isOneDataset
                } else return false;

            } else if(comparisonKey[0] == "LT" || comparisonKey[0] == "GT" || comparisonKey[0] == "EQ"){ //checks for MCOMPARATOR
                validProjectKey = Object.keys(comparisonValue);
                mComparisonNumber = comparisonValue[validProjectKey[0]];
                var yesOrNo = Object.keys(isOneDataset)[0];
                var dataSet = isOneDataset[yesOrNo];
                if( validProjectKey.length == 1 && (validProjectKey[0] == "courses_avg" || validProjectKey[0] == "courses_pass" ||
                    validProjectKey[0] == "courses_fail" || validProjectKey[0] == "courses_audit" || validProjectKey[0] == "courses_year")){ //make sure only a valid key exists
                    if(yesOrNo == "true" && (dataSet[0] == "courses" || dataSet.length == 0)) {
                        if (isNumber(mComparisonNumber)) { //makes sure the valid keys are mapped to a number
                            isOneDataset = {"true": ["courses"]};
                            return isOneDataset;
                            //TODO VALENTINES
                        } else return false;
                    } else if(yesOrNo == "true" && (dataSet[0] != "courses")){
                        var invalidIdLists = validProjectKey[0].split("_");

                        if(invalidIdArray.includes(invalidIdLists[0])){
                            invalidIdLists = [];
                        } else {
                            invalidIdArray.push(invalidIdLists[0]);
                        }
                        isOneDataset = {"false":invalidIdArray}
                        return isOneDataset;

                    } else return isOneDataset
                 }
                else if(validProjectKey.length == 1 && (validProjectKey[0] == "rooms_lat" || validProjectKey[0] == "rooms_lon" ||
                    validProjectKey[0] == "rooms_seats")){ //make sure only a valid key exists

                    if(yesOrNo == "true" && (dataSet[0] == "rooms" || dataSet.length == 0)) {
                        if (isNumber(mComparisonNumber)) { //makes sure the valid keys are mapped to a number
                            isOneDataset = {"true": ["rooms"]};
                            return isOneDataset;
                            //TODO VALENTINES
                        } else return false;
                    } else if(yesOrNo == "true" && (dataSet[0] != "rooms")){
                        return isOneDataset;
                    } else return isOneDataset
                }
                else if(typeof validProjectKey[0] == "string" && !(validProjectKey[0].startsWith("courses")) && (this.occurrences(validProjectKey[0], "_", true)) == 1 &&
                    (validProjectKey[0].endsWith("_avg") || validProjectKey[0].endsWith("_pass") ||
                    validProjectKey[0].endsWith("_fail") || validProjectKey[0].endsWith("_audit") || validProjectKey[0].endsWith("_year"))){

                    var invalidIdLists = validProjectKey[0].split("_");

                    if(invalidIdArray.includes(invalidIdLists[0])){
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset;
                } else if(typeof validProjectKey[0] == "string" && !(validProjectKey[0].startsWith("rooms")) && (this.occurrences(validProjectKey[0], "_", true)) == 1 &&
                    (validProjectKey[0].endsWith("_lat") || validProjectKey[0].endsWith("_lon") ||
                    validProjectKey[0].endsWith("_seats"))){

                    var invalidIdLists = validProjectKey[0].split("_");

                    if(invalidIdArray.includes(invalidIdLists[0])){
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset;
                } else if(typeof validProjectKey[0] == "string" && !(validProjectKey[0].startsWith("courses") || !(validProjectKey[0].startsWith("rooms")) && validProjectKey[0].includes("_"))){

                    var invalidIdLists = validProjectKey[0].split("_");

                    if(invalidIdArray.includes(invalidIdLists[0])){
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset;

                } else return false;


            } else if (comparisonKey[0] == "IS"){ //SComparator

                validProjectKey = Object.keys(comparisonValue);
                sComparisonString = comparisonValue[validProjectKey[0]];
                var yesOrNo = Object.keys(isOneDataset)[0];
                var dataSet = isOneDataset[yesOrNo];
                if(validProjectKey.length == 1  && (this.occurrences(validProjectKey[0], "_", true)) == 1 && (validProjectKey[0] == "courses_dept" || validProjectKey[0] == "courses_id"|| validProjectKey[0] == "courses_instructor"||validProjectKey[0] == "courses_title" || validProjectKey[0] == "courses_uuid")){
                    if(yesOrNo == "true" && (dataSet == "courses" || dataSet.length == 0)) {
                        if (isString(sComparisonString) || (sComparisonString.toString().charAt(0) && sComparisonString.toString().charAt(sComparisonString.toString().length - 1) &&
                            isString(sComparisonString))) {
                            isOneDataset = {"true": ["courses"]};
                            return isOneDataset;

                        } else return false;
                    } else if(yesOrNo == "true" && (dataSet[0] != "courses")){
                        var invalidIdLists = validProjectKey[0].split("_");

                        if(invalidIdArray.includes(invalidIdLists[0])){
                            invalidIdLists = [];
                        } else {
                            invalidIdArray.push(invalidIdLists[0]);
                        }
                        isOneDataset = {"false":invalidIdArray}
                        return isOneDataset;

                    } else return isOneDataset
                }else if(validProjectKey.length == 1  && (this.occurrences(validProjectKey[0], "_", true)) == 1 && (validProjectKey[0] == "rooms_fullname" || validProjectKey[0] == "rooms_shortname"|| validProjectKey[0] == "rooms_number"||validProjectKey[0] == "rooms_address" || validProjectKey[0] == "rooms_type"
                    || validProjectKey[0] == "rooms_furniture" || validProjectKey[0] == "rooms_href")){
                    if(yesOrNo == "true" && (dataSet == "rooms" || dataSet.length == 0)) {
                        if (isString(sComparisonString) || (sComparisonString.toString().charAt(0) && sComparisonString.toString().charAt(sComparisonString.toString().length - 1) &&
                            isString(sComparisonString))) {
                            if(validProjectKey[0] == "rooms_name"){
                                if(sComparisonString == comparisonValue["rooms_shortname"]+"_"+comparisonValue["rooms_number"]){
                                    isOneDataset = {"true": ["rooms"]};
                                    return isOneDataset;
                                }else return false
                            }else {
                                isOneDataset = {"true": "rooms"};
                                return isOneDataset;
                            }

                        } else return false;
                    } else if(yesOrNo == "true" && (dataSet[0] != "rooms")){
                        var invalidIdLists = validProjectKey[0].split("_");

                        if(invalidIdArray.includes(invalidIdLists[0])){
                            invalidIdLists = [];
                        } else {
                            invalidIdArray.push(invalidIdLists[0]);
                        }
                        isOneDataset = {"false":invalidIdArray}
                        return isOneDataset;

                    } else isOneDataset
                } else if(typeof validProjectKey[0] == "string" && !(validProjectKey[0].startsWith("courses")) &&
                    (validProjectKey[0].endsWith("_dept") || validProjectKey[0].endsWith("_id") ||
                    validProjectKey[0].endsWith("_instructor") || validProjectKey[0].endsWith("_title")|| validProjectKey[0].endsWith("_uuid"))){

                    var invalidIdLists = validProjectKey[0].split("_");

                    if(invalidIdArray.includes(invalidIdLists[0])){
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset;

                }else if(typeof validProjectKey[0] == "string" && !(validProjectKey[0].startsWith("rooms")) &&
                    (validProjectKey[0].endsWith("_fullname") || validProjectKey[0].endsWith("_shortname") ||
                    validProjectKey[0].endsWith("_number") || validProjectKey[0].endsWith("_name")|| validProjectKey[0].endsWith("_address"))){

                    var invalidIdLists = validProjectKey[0].split("_");

                    if(invalidIdArray.includes(invalidIdLists[0])){
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset;
                }else if(typeof  validProjectKey[0] == "string" && !(validProjectKey[0].startsWith("courses") || !(validProjectKey[0].startsWith("rooms")) && validProjectKey[0].includes("_"))){

                    var invalidIdLists = validProjectKey[0].split("_");

                    if(invalidIdArray.includes(invalidIdLists[0])){
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset;
                }else return false;

            } else if (comparisonKey[0] == "NOT"){ //NEGATION
                isOneDataset = this.hasFilter(comparisonValue, invalidIdArray, isOneDataset)
                if(isOneDataset != false){ //loops back to FILTER
                    Log.test("NEGATION is good")
                    return isOneDataset;
                } else return false
            } else return false
        }else return false
    }

    hasArrayFilter(filterArray:FilterQuery[], invalidIdArray:string[], isOneDataset:any):boolean|string[]{

            if(filterArray.length > 0) {
                for (let x in filterArray) {
                    isOneDataset = this.hasFilter(filterArray[x], invalidIdArray, isOneDataset);
                    if (isOneDataset == false) {//checks if each element is actually FILTER
                        return false
                    }
                } return isOneDataset
            } else return false


    }

    occurrences(string:string, subString:string, allowOverlapping:boolean) {

        string += "";
        subString += "";
        if (subString.length <= 0) return (string.length + 1);

        var n = 0,
            pos = 0,
            step = allowOverlapping ? 1 : subString.length;

        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else break;
        }
        return n;
    }

}
