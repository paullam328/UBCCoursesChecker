/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest, FilterQuery, TransformationQuery} from "./IInsightFacade";

import Log from "../Util";
import {isString} from "util";
import {isNumber} from "util";
import {isUndefined} from "util";
//import {read} from "fs";
import {isNullOrUndefined} from "util";
import {isNull} from "util";

//import {objectify} from "tslint/lib/utils";

export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');

    }


    //set 'that' to higher level because the scope is limited within the promise if it's within the promise

    addDataset(id: string, content: string): Promise<InsightResponse> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            //var listOfParsedJson = "".split("\n");

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

            // for parsing latlon *hardest part*


            var arrayOfAddr : string[] = [];
            var arrayOfParsedJson: string[] = [];
            //var newParsedJ = "";
            var isHTML = false;


            //for error 400:
            var invalidRoomCounter = 0;

            var listOfValidShortNames: string[] = [];
            var listOfValidFullNames: string[] = [];
            var listOfValidAddresses: string[] = [];
            var listOfValidUrls: string[] = [];

            //for irongate
            var isInvalidId = false;
            var coursesCounter = 0;
            var roomsCounter = 0;
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

                        for (let veryinitial in arrayofUnparsedFileDataAll) {
                            if (String(arrayofUnparsedFileDataAll[veryinitial]).includes('{"result":')
                                && String(arrayofUnparsedFileDataAll[veryinitial]).includes(',"rank":')) {
                                coursesCounter++;
                            }
                            if (String(arrayofUnparsedFileDataAll[veryinitial]).includes("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML+RDFa 1.1//EN\">")) {
                                roomsCounter++;
                            }
                        }
                        if ((coursesCounter > 0 && roomsCounter == 0 && id == "rooms")
                            || (coursesCounter == 0 && roomsCounter > 0 && id == "courses")) {
                            var ir2: InsightResponse = {
                                code: 400,
                                body: {'error': 'illegal attempt to add dataset with the wrong id.'}
                            };
                            isInvalidId = true;
                            reject(ir2);
                            return;
                        }



                        for (let initial in arrayofUnparsedFileDataAll) {
                            if ((String(arrayofUnparsedFileDataAll[initial])
                                    .includes('Select a room below for more information about its amenities. Where available, photos taken from the instructor and student viewpoints are also shown.'))
                                    &&
                                        (String(arrayofUnparsedFileDataAll[initial])
                                    .includes('ACU'))
                                && (String(arrayofUnparsedFileDataAll[initial])
                                    .includes('ALRD'))
                                && (String(arrayofUnparsedFileDataAll[initial])
                                    .includes('ANSO'))

                        ) {
                                //console.log(arrayofUnparsedFileDataAll[initial]);
                                that.validStringListOfBuildings(that, listOfValidShortNames, listOfValidFullNames, listOfValidAddresses, listOfValidUrls,String(arrayofUnparsedFileDataAll[initial]));
                                //delete arrayofUnparsedFileDataAll[initial];
                                delete (arrayofUnparsedFileDataAll[initial]);
                                //no need to minus noofFiles since it's not calculated yet
                            }

                        }

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

                                //for irongate
                                isHTML = true;/*
                                var listOfValidShortNames: string[] = [];
                                var listOfValidFullNames: string[] = [];
                                var listOfValidAddresses: string[] = [];
                                var listOfValidUrls: string[] = [];*/


                                    //find index.htm within the zip, or else it would throw a runtime error

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

                                        try {
                                            readyToBeZoomedInHtmlData = htmlData;
                                            readyToBeZoomedInHtmlData = that.setZoomToTagName(readyToBeZoomedInHtmlData, 'html');
                                            readyToBeZoomedInHtmlData = that.setZoomToTagName(readyToBeZoomedInHtmlData, 'body');
                                            readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'full-width-container');
                                            readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'main');
                                            readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'content');
                                            readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'block-system-main');
                                            readyToBeZoomedInHtmlData = that.setZoomToClassOrId(readyToBeZoomedInHtmlData, 'view-buildings-and-classrooms');
                                        } catch (e) {
                                            invalidRoomCounter++;
                                            console.log(`++1`);
                                            e;
                                        }

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
                                    } else {
                                        invalidRoomCounter++;
                                    }
                                } catch (e) {
                                    invalidRoomCounter++;
                                    console.log(`++`);
                                    e;

                                    //Log.info("err is:" + e + "and room name includes: " + rooms_fullname);
                                } //try catch just to catch the weirdest error caused by Main Mall Theatre (aka. MAUD)

                                    if (listOfValidFullNames.includes(rooms_fullname)) {//invalid room full name --> invalid building --> invalidBuildingCounter++
                                        //Log.info(rooms_fullname);

                                        var htmlDataForAddress = readyToBeZoomedInHtmlData;
                                        htmlDataForAddress = that.setZoomToClassOrId(htmlDataForAddress, 'building-field');
                                        htmlDataForAddress = that.setZoomToClassOrId(htmlDataForAddress, 'field-content');
                                        rooms_address = htmlDataForAddress.childNodes[0].value;
                                        //Log.info(rooms_address);
                                        arrayOfAddr.push(rooms_address);


                                        if (listOfValidAddresses.includes(rooms_address)) {

                                            rooms_shortname = listOfValidShortNames[listOfValidFullNames.indexOf(rooms_fullname)].replace(/^\s+|\s+$/g, "");
                                            rooms_href = "http://students.ubc.ca" + listOfValidUrls[listOfValidFullNames.indexOf(rooms_fullname)].replace(".", "");

                                            //TODO: parsedJSON will return {result:[...]}
                                            htmlDataFromTable = that.setZoomToClassOrId(htmlDataFromTable, 'view-footer');
                                            htmlDataFromTable = that.setZoomToClassOrId(htmlDataFromTable, 'view-buildings-and-classrooms');
//TODO: Uncomment this
                                            //console.log(!isUndefined(that.setZoomToClassOrId(htmlDataFromTable, 'view-content')));
                                            if (!isUndefined(that.setZoomToClassOrId(htmlDataFromTable, 'view-content'))) {
                                                htmlDataFromTable = that.setZoomToClassOrId(htmlDataFromTable, 'view-content');
                                                htmlDataFromTable = that.setZoomToClassOrId(htmlDataFromTable, 'views-table');
                                                htmlDataFromTable = that.setZoomToTagName(htmlDataFromTable, 'tbody');

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
                                                                    //Log.info("rooms_number:" + rooms_number);

                                                                    var roomCapacityNode = that.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-field-room-capacity");
                                                                    rooms_seats = roomCapacityNode[0].value.replace(/^\s+|\s+$/g, "");
                                                                    //Log.info("rooms_seats:" + rooms_seats);

                                                                    var roomsFurnitureNode = that.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-field-room-furniture");
                                                                    rooms_furniture = roomsFurnitureNode[0].value.replace(/^\s+|\s+$/g, "");
                                                                    //Log.info("rooms_furniture:" + rooms_furniture);

                                                                    var roomsTypeNode = that.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-field-room-type");
                                                                    rooms_type = roomsTypeNode[0].value.replace(/^\s+|\s+$/g, "");
                                                                    //Log.info("rooms_type:" + rooms_type);

                                                                    var roomsHrefInitial = that.scanRowForInfoWithoutChildNodes(rowHtml, "views-field-nothing");
                                                                    var roomHrefNode = that.getInnerAttrInsteadOfChildNode(roomsHrefInitial, "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/");
                                                                    //hardcode here:
                                                                    rooms_href = roomHrefNode[0].value.replace(/^\s+|\s+$/g, "");
                                                                    //Log.info("rooms_href:" + rooms_href);
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
                                                       invalidRoomCounter++;
                                                        console.log(`+++`);
                                                        e;
                                                       // Log.info(e);
                                                    }

                                                }

                                            } else {
                                                //console.log(`passed through here`);
                                                rooms_name = rooms_shortname;

                                                invalidRoomCounter++;

                                                //arrayOfAddr.push(rooms_address);


                                                //they said "buildings with no rooms shouldn't be considered
                                                /*parsedJSON += '{\"result\":[' +
                                                    '{\"rooms_fullname\":\"' + rooms_fullname + '\",' +
                                                    '\"rooms_shortname\":\"' + rooms_shortname + '\",' +
                                                    '\"rooms_name\":\"' + rooms_name + '\",' +
                                                    '\"rooms_address\":\"' + rooms_address + '\",' +
                                                    '\"rooms_lat\":' + rooms_lat + ',' +
                                                    '\"rooms_lon\":' + rooms_lon + ',' +
                                                    '\"rooms_href\":\"' + rooms_href + '\"}' +
                                                    '],\"rank\":0}' + '\r\n';*/
                                            }

                                        }
                                    } else {
                                        invalidRoomCounter++;
                                    }
                                }


                            //Log.info(parsedJSON);
                       }
                        //Log.info(parsedJSON);

                        arrayOfParsedJson = parsedJSON.split("\r\n");
                        return parsedJSON;
                    }).then(function(parsed) {
                        if (noOfFiles == 0) {
                            var ir2: InsightResponse = {code: 400, body: {'error': 'no datafile is found'}};
                            reject(ir2);
                        }

                        //console.log(`invalidRoomCounter: ${invalidRoomCounter}`);
                        //console.log(`noOfFiles: ${noOfFiles}`);

                        if (filesNotJsonOrArrayOrHTMLCounter + invalidRoomCounter == noOfFiles) {
                            var ir2: InsightResponse = {code: 400, body: {'error': 'cannot set a valid zip that does not contain any real data.'}};
                            reject(ir2);
                        }
                        return parsed;
                    }).then(function(parsedJ) {
                        if (isInvalidId) {
                            return;
                        }

                        if (!fs.existsSync(id) && noOfFiles >  0 && filesNotJsonOrArrayOrHTMLCounter + invalidRoomCounter < noOfFiles) {
                            if (isHTML == true) {

                                var listOfLatLon: string[] = [];

                                var aList: any[] = [];

                                that.pushParsedJPromisesToArray(that, aList, arrayOfAddr, invalidRoomCounter);

                                Promise.all(aList).then(function (finallatlon) {

                                    //newParsedJ = insertLatLonToParsedJson(parsedJ);

                                    var newParsedJ = "";


                                    //that.insertLatLonToParsedJson(finallatlon, arrayOfAddr, arrayOfParsedJson, newParsedJ);

                                    for (let f in finallatlon) { //at first, convert those finallatlon to json object
                                        var json = JSON.parse(finallatlon[f]);
                                        finallatlon[f] = json;
                                    }

                                    for (let i in finallatlon) {
                                        for (let j in arrayOfParsedJson) {
                                            for (let k in arrayOfAddr) {
                                                if (arrayOfParsedJson[j].includes(arrayOfAddr[k])
                                                    && (finallatlon[i]).addr == arrayOfAddr[k]) {
                                                    var startingNum = arrayOfParsedJson[j].indexOf("\"rooms_lat\":") + "\"rooms_lat\":".length;
                                                    var middleBeginNum = arrayOfParsedJson[j].indexOf("\,\"rooms_lon\":");
                                                    var middleEndNum = arrayOfParsedJson[j].indexOf("\,\"rooms_lon\":") + "\"rooms_lon\":".length + 1;
                                                    var endingNum = arrayOfParsedJson[j].indexOf("\,\"rooms_seats\":");
                                                    var startingString = arrayOfParsedJson[j].substring(0, startingNum);
                                                    var middleString = arrayOfParsedJson[j].substring(middleBeginNum, middleEndNum);

                                                    var lat = finallatlon[i].lat;
                                                    var lon = finallatlon[i].lon;

                                                    if (!arrayOfParsedJson[j].includes("\,\"rooms_seats\":")) {
                                                        endingNum = arrayOfParsedJson[j].indexOf("\,\"rooms_href\":");
                                                    }
                                                    var endingString = arrayOfParsedJson[j].substring(endingNum, arrayOfParsedJson[j].length);
                                                    var newString = startingString + lat + middleString + lon + endingString;

                                                    newParsedJ = newParsedJ + newString + "\r\n";
                                                }
                                            }
                                        }
                                    }

                                    try {
                                        fs.writeFileSync(id, newParsedJ);
                                    } catch (e) {
                                        var ir2: InsightResponse = {code: 400, body: {'error': 'cannot writefile'}};
                                        reject(ir2);
                                    }

                                   // console.log(`invalidRoomCounter:${invalidRoomCounter}`);

                                    var ir4: InsightResponse = {code: 204, body: {}};
                                    fulfill(ir4);
                                });
                            } else {
                                try {
                                    fs.writeFileSync(id, parsedJ);
                                } catch (e) {
                                    var ir2: InsightResponse = {code: 400, body: {'error': 'cannot writefile'}};
                                    reject(ir2);
                                }

                                var ir4: InsightResponse = {code: 204, body: {}};
                                fulfill(ir4);
                            }

                        }
                        return parsedJ
                    }).then(function(parsedJ){
                        if (isInvalidId) {
                            return;
                        }

                        if (fs.existsSync(id) && noOfFiles >  0 && filesNotJsonOrArrayOrHTMLCounter + invalidRoomCounter < noOfFiles) {

                            //if unparsefiledata.includes(Addr), extract the latlon
                            // for each latlon, store them into a list of latlon (to be created)
                            //for each line, return the latlon

                            //pushParsedJPromisesToArray(aList)
                            //newParsedJ = insertLatLonToParsedJson(parsedJ);

                            if (isHTML == true) {

                                var listOfLatLon: string[] = [];

                                var aList: any[] = [];

                                that.pushParsedJPromisesToArray(that, aList, arrayOfAddr, invalidRoomCounter);

                                Promise.all(aList).then(function (finallatlon) {

                                    //newParsedJ = insertLatLonToParsedJson(parsedJ);

                                    var newParsedJ = "";


                                    //that.insertLatLonToParsedJson(finallatlon, arrayOfAddr, arrayOfParsedJson, newParsedJ);

                                    for (let f in finallatlon) { //at first, convert those finallatlon to json object
                                        var json = JSON.parse(finallatlon[f]);
                                        finallatlon[f] = json;
                                    }

                                    for (let i in finallatlon) {
                                        for (let j in arrayOfParsedJson) {
                                            for (let k in arrayOfAddr) {
                                                if (arrayOfParsedJson[j].includes(arrayOfAddr[k])
                                                    && (finallatlon[i]).addr == arrayOfAddr[k]) {
                                                    var startingNum = arrayOfParsedJson[j].indexOf("\"rooms_lat\":") + "\"rooms_lat\":".length;
                                                    var middleBeginNum = arrayOfParsedJson[j].indexOf("\,\"rooms_lon\":");
                                                    var middleEndNum = arrayOfParsedJson[j].indexOf("\,\"rooms_lon\":") + "\"rooms_lon\":".length + 1;
                                                    var endingNum = arrayOfParsedJson[j].indexOf("\,\"rooms_seats\":");
                                                    var startingString = arrayOfParsedJson[j].substring(0, startingNum);
                                                    var middleString = arrayOfParsedJson[j].substring(middleBeginNum, middleEndNum);

                                                    var lat = finallatlon[i].lat;
                                                    var lon = finallatlon[i].lon;

                                                    if (!arrayOfParsedJson[j].includes("\,\"rooms_seats\":")) {
                                                        endingNum = arrayOfParsedJson[j].indexOf("\,\"rooms_href\":");
                                                    }
                                                    var endingString = arrayOfParsedJson[j].substring(endingNum, arrayOfParsedJson[j].length);
                                                    var newString = startingString + lat + middleString + lon + endingString;

                                                    newParsedJ = newParsedJ + newString + "\r\n";
                                                }
                                            }
                                        }
                                    }

                                    try {
                                        fs.writeFileSync(id, newParsedJ);
                                    } catch (e) {
                                        var ir2: InsightResponse = {code: 400, body: {'error': 'cannot writefile'}};
                                        reject(ir2);
                                    }


                                    //for testing purpose
                                    //console.log(`invalidRoomCounter:${invalidRoomCounter}`);

                                    var ir4: InsightResponse = {code: 201, body: {}};
                                    fulfill(ir4);
                                });
                            } else {
                                try {
                                    fs.writeFileSync(id, parsedJ);
                                } catch (e) {
                                    var ir2: InsightResponse = {code: 400, body: {'error': 'cannot writefile'}};
                                    reject(ir2);
                                }

                                var ir4: InsightResponse = {code: 201, body: {}};
                                fulfill(ir4);
                            }
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

    getLatLon(rooms_address:string, invalidRoomCounter:number):Promise<any> {
        return new Promise(function(fulfill,reject) {
            var latlonString = "";
            var http = require('http');
            var url = 'http://skaha.cs.ubc.ca:11316/api/v1/team45/' + (rooms_address.replace(/\s/g,"%20"));
            var jaj = "";
                var cheese = http.get(url, (res: any) => { //when the connection is established
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
                     //console.log(error.message);
                     // consume response data to free up memory
                         invalidRoomCounter++;
                     res.resume();
                     return;
                     }


                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk: any) => rawData += chunk); //when there's a chunk of data

                    res.on('end', () => { //when the connection closes
                        try {
                            let parsedData = JSON.parse(rawData);
                            let lat = parsedData.lat;
                            let lon = parsedData.lon;
                            latlonString = '{"addr":"' + rooms_address + '","lat":' + lat;
                            latlonString = latlonString + ',"lon":' + lon + '}';

                            //console.log(`latlonString: ${latlonString}`);

                            //console.log(parsedData);
                            //console.log(lat);
                            //console.log(lon);

                            //Log.info("lat is:" + lat);
                            // Log.info("lon is:" + lon);
                            fulfill(latlonString);
                        } catch (e) {
                           // console.log(e.message);
                            invalidRoomCounter++;
                        }
                    });

                }).on('error', (e: Error) => {
                    //console.log(`Got error: ${e.message}`);
                    //console.log(`Got error: ${e.message}`);
                    //Log.info("got error:" + e.message);
                    invalidRoomCounter++;

                });

                //console.log(latlonString);
                //fulfill(latlonString);
                //cheese;

                //var js = JSON.stringify(parse1);
        });
    }

    pushParsedJPromisesToArray(isthis:any,arrayOfPromises:any,arrayOfAddr:string[],invalidRoomCounter:number):any {
        for (let i in arrayOfAddr) {
            var p = new Promise((fulfilltiny, rejecttiny) => {
                var newString = isthis.getLatLon(arrayOfAddr[i],invalidRoomCounter).then(function (latlon:any) {
                    fulfilltiny(latlon); //<-- obviously you fulfill the result instead of new string...
                });
            });

            arrayOfPromises.push(p);
        }
    }


    validStringListOfBuildings(isthis:any,shortNameList:string[],fullNameList:string[],addressList:string[],hrefList:string[],indexString:string): any {
       // Log.info("it runs?");
        var fs = require('fs');
        var parse5 = require('parse5');
       //var htmlData = parse5.parse(fs.readFileSync('index.htm',{encoding: 'utf8'}));
        var htmlData = parse5.parse(indexString);
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

        for (let i in readyToBeZoomedInHtmlData.childNodes) {

                    for (let a in readyToBeZoomedInHtmlData.childNodes[i].attrs) {
                        if (readyToBeZoomedInHtmlData.childNodes[i].attrs[a].value.includes("odd")
                            || readyToBeZoomedInHtmlData.childNodes[i].attrs[a].value.includes("even")) {


                            var rowHtml = readyToBeZoomedInHtmlData.childNodes[i].childNodes;

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

    //TODO: if (<key> not found in UBCInsight) {return promise 400 body: {invalid <key>}}
    /*TODO: return a promise --> search in UBCInsight (this is hell lot easier man...)
    //TODO: Store each Query of UBCInsight into an arrayOfQuery (.split(\r\n))
    //TODO: If (contains(keyword) -> extract the value of the key)


    //TODO: Go into file and split through \r\n

    // if (match with the content within the file-->
     */  performQuery(query: QueryRequest): Promise <InsightResponse> {
        //perform query
        var fs = require("fs");
        //console.time("start query check")
        var queryCheck = this.isValid(query);
        //console.timeEnd("start query check")
        var newThis = this;
        var yesOrNo = Object.keys(queryCheck)[0];
        var dataSetId = queryCheck[yesOrNo];

        return new Promise(function (resolve, reject) {

            if(yesOrNo == "true"){
                var filter = query.WHERE
                var columns = query.OPTIONS.COLUMNS;
                var order:any =  query.OPTIONS.ORDER;
                var table = query.OPTIONS.FORM;
                var transformation:TransformationQuery = query.TRANSFORMATIONS;
                var transformationGroup:any;
                var singleGroup;
                var transformationApply:any;
                var newTransformationApply:any[] = [];
                var applyExists:boolean = true;
                var transformationExists:any = false;
                var keys = Object.keys(filter);
                var result = filter[keys[0]]; //value of the WHERE Filters
                var validKey;
                var contentDatasetResult;
                var datasetResultArray;
                //var cachedId = fs.readFileSync("existingIds_Don\'tMakeAnotherIdOfThisFileName").toString;
                //var cachedIdArray = cachedId.split("\r\n");
                //var nonExistIdArray = [];

                if(!isUndefined(transformation)){
                    transformationExists = true;
                    transformationApply = query.TRANSFORMATIONS.APPLY
                    transformationGroup = transformation.GROUP
                }

                var grabbingIDColumnKey = columns[0];
                validKey = grabbingIDColumnKey.split("_");
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
                //console.time("parse through extracted content")
                datasetResultArray = contentDatasetResult.split("\r\n")
                //console.timeEnd("parse through extracted content")



                // example empty result {"result":[],"rank":0}
                // example valid result {"result":[section1, section2, etc...], "rank":0}

                if(datasetResultArray.length > 0) {
                    var lmaoWeDone;
                    var finalReturn:any[] = [];
                    var groupedApplyArray:any[] = [];
                    var returnInfo:any = {};
                    var atomicReturnInfo:any; //building block of query's return based on valid Keys
                    //console.time("go through datasetResultArray overall")
                    for (let x in datasetResultArray) { //iterates through the array of results, now just a result
                        /**if(Number(x) == 123){
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
                                 return reject(code400InvalidQuery);*/
                            } else {
                                if (sectionArray instanceof Array && sectionArray.length > 0) { //going into the arrays of sections and organizing them based on the OPTIONS
                                    //console.time("one course")
                                    for (let x in sectionArray) {
                                        singleSection = sectionArray[x]
                                        /**if(Number(x) == 4){
                                            Log.info("continue debug")
                                        }*/
                                        var overallSection:boolean = false;
                                        for(var sectionValidKey in singleSection) {

                                            if(validKey[0] == "courses"){
                                                translatedKey = newThis.vocabDataBase(sectionValidKey)
                                            }else {translatedKey = sectionValidKey}

                                            if(sectionValidKey == "Section" && singleSection[sectionValidKey] == "overall"){
                                                overallSection = true;
                                                atomicReturnInfo = {"courses_year":1900}
                                                returnInfo = Object.assign({}, returnInfo, atomicReturnInfo);
                                                sectionValidKey = null;
                                                atomicReturnInfo = null;
                                            }else if((translatedKey == "courses_year" && overallSection == true) ||
                                                (sectionValidKey == "Section" && singleSection[sectionValidKey] != "overall")){
                                                overallSection = false;
                                            }else if(translatedKey == false){
                                                translatedKey = translatedKey
                                            }   else if(translatedKey == true) {
                                                translatedKey = translatedKey
                                            }else {
                                                if(translatedKey == "courses_uuid" && typeof singleSection[sectionValidKey] == "number"){
                                                    var uuid = singleSection[sectionValidKey];
                                                    var stringUuid = uuid.toString();

                                                    /**if (isUndefined(uuid)) {
                                                        var code400InvalidQuery: InsightResponse = {
                                                            code: 400,
                                                            body: {"error": "malformed dataset with no key in result"}
                                                        };
                                                        return reject(code400InvalidQuery);
                                                    } else {*/
                                                    atomicReturnInfo = {[translatedKey]:stringUuid}

                                                    returnInfo = Object.assign({}, returnInfo, atomicReturnInfo);
                                                    //Log.info(returnInfo);

                                                    //should look like {"courses_avg":95, "courses_instructor":"bleh"}
                                                    //}
                                                }else
                                                if(translatedKey == "courses_year" && typeof singleSection[sectionValidKey] == "string"){
                                                    var year = singleSection[sectionValidKey];
                                                    var numberYear = Number(year);

                                                    atomicReturnInfo = {[translatedKey]:numberYear}

                                                    returnInfo = Object.assign({}, returnInfo, atomicReturnInfo);
                                                    //Log.info(returnInfo);

                                                    //should look like {"courses_avg":95, "courses_instructor":"bleh"}
                                                    //}
                                                }
                                                else{
                                                    atomicReturnInfo = {[translatedKey]: singleSection[sectionValidKey]}
                                                    /**if (isUndefined(singleSection[sectionValidKey])) {
                                                        var code400InvalidQuery: InsightResponse = {
                                                            code: 400,
                                                            body: {"error": "malformed dataset with no key in result"}
                                                        };
                                                        return reject(code400InvalidQuery);
                                                    } else {*/


                                                    returnInfo = Object.assign({}, returnInfo, atomicReturnInfo);
                                                    sectionValidKey = null;
                                                    atomicReturnInfo = null;
                                                    //Log.info(returnInfo);

                                                    //should look like {"courses_avg":95, "courses_instructor":"bleh"}
                                                    //}
                                                }
                                            }
                                        }
                                        if(!isUndefined(result)) {
                                            if(!isNullOrUndefined(returnInfo["courses_pass"]) && !isNullOrUndefined(returnInfo["courses_fail"])){
                                                var tempTempValue = Number(returnInfo["courses_pass"]) + Number(returnInfo["courses_fail"])
                                                returnInfo = Object.assign({}, returnInfo, {"courses_sectionsize":tempTempValue})
                                            }
                                            returnInfo = newThis.filterQueryRequest(returnInfo, result, keys);
                                        }
                                        //Log.info(returnInfo);
                                        if(isNullOrUndefined(returnInfo) || returnInfo.length == 0){
                                            returnInfo = returnInfo
                                        }else {
                                            var cachedReturnInfo;
                                            var tempApplyKey;
                                            var groupedApplyColumns
                                            //returnInfo = {}
                                            for (let x in columns) {

                                                singleColumnKey = columns[x].toString()

                                                if (transformationExists == true) {
                                                    if (transformationApply.length == 0) {
                                                        applyExists = false;
                                                    }

                                                    //checking apply is in columns and vice versa
                                                    tempApplyKey = newThis.applyHasColumn(transformationApply, singleColumnKey)
                                                    if (isNullOrUndefined(returnInfo) || returnInfo.length == 0) {
                                                        cachedReturnInfo = cachedReturnInfo;
                                                    } else if (applyExists == true && tempApplyKey.length > 0) {
                                                        //console.time("new transformation")
                                                        for (let x in transformationGroup) {

                                                            singleGroup = transformationGroup[x].toString()

                                                            if (returnInfo.hasOwnProperty(singleGroup)) {

                                                                cachedReturnInfo = Object.assign({}, cachedReturnInfo, {[singleGroup]: returnInfo[singleGroup]});

                                                            }

                                                        }

                                                        if (tempApplyKey.some(isUndefined)) {
                                                            continue;
                                                        } else {
                                                            for (let x in tempApplyKey) {
                                                                if (isUndefined(tempApplyKey[x])) {
                                                                    continue;
                                                                } else {
                                                                    if (newTransformationApply.includes(tempApplyKey[x])) {
                                                                        continue;
                                                                    } else {
                                                                        newTransformationApply.push(tempApplyKey[x])
                                                                        //newTransformReturnInfo = null

                                                                    }
                                                                }
                                                            }
                                                        }
                                                        groupedApplyColumns = newThis.applyObjects(newTransformationApply, returnInfo)

                                                    } else {
                                                        for (let x in transformationGroup) {

                                                            singleGroup = transformationGroup[x].toString()

                                                            if (returnInfo.hasOwnProperty(singleGroup)) {

                                                                cachedReturnInfo = Object.assign({}, cachedReturnInfo, {[singleGroup]: returnInfo[singleGroup]});

                                                            }

                                                        }
                                                    }


                                                } else {

                                                    //translatedKey = newThis.vocabValidKey(singleColumnKey);
                                                    /**if(translatedKey == false){
                                                    var code400InvalidQuery:InsightResponse = {code:400, body:{"error":"malformed key"}};
                                                    reject(code400InvalidQuery);
                                                }   else if(translatedKey == true) {
                                                    continue;
                                                }else{*/

                                                    if (isNullOrUndefined(returnInfo)) {
                                                        cachedReturnInfo = cachedReturnInfo;
                                                    } else if (transformationExists == true) {
                                                        cachedReturnInfo = Object.assign({}, cachedReturnInfo, returnInfo);

                                                    }
                                                    else if (returnInfo.hasOwnProperty(singleColumnKey)) {
                                                        /**if(Number(x) == 0){
                                                            returnInfo = {};
                                                        }*/


                                                        cachedReturnInfo = Object.assign({}, cachedReturnInfo, {[singleColumnKey]: returnInfo[singleColumnKey]});


                                                    } else
                                                    /**if (isUndefined(returnInfo[singleColumnKey])) {
                                                        var code400InvalidQuery: InsightResponse = {
                                                            code: 400,
                                                            body: {"error": "malformed dataset with no key in result"}
                                                        };
                                                        return reject(code400InvalidQuery);
                                                    } else */{

                                                        //cachedReturnInfo = Object.assign({}, cachedReturnInfo, {[singleColumnKey]: returnInfo[singleColumnKey]});
                                                        cachedReturnInfo = null;
                                                        returnInfo = null;

                                                        //returnInfo = returnInfo
                                                        //returnInfo = Object.assign({}, returnInfo, atomicReturnInfo);
                                                        //Log.info(returnInfo);

                                                        //should look like {"courses_avg":95, "courses_instructor":"bleh"]
                                                    }
                                                    //}
                                                    /**if(result instanceof Array && result.length == 0){
                                                result = result[0]
                                            }*/


                                                }
                                            }returnInfo = null;
                                            if(isNullOrUndefined(cachedReturnInfo)){
                                                continue;
                                            }else {
                                                finalReturn.push(cachedReturnInfo);
                                                if(!isNullOrUndefined(groupedApplyColumns)) {
                                                    groupedApplyArray.push(groupedApplyColumns);
                                                    groupedApplyColumns = {};
                                                }
                                            }
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



                            }
                        }
                    } //console.timeEnd("go through datasetResultArray overall")

                    if(transformationExists == true) {
                        var applyString:any;

                        var singleApply;
                        var tokenPlusKey;
                        var tempToken;
                        var applyFinalKey;
                        /**
                         for(let x in transformationApply){

                            applyString = Object.keys(transformationApply[x])[0]
                            singleApply = transformationApply[x];
                            tokenPlusKey = singleApply[applyString]
                            tempToken = Object.keys(applyString)[0];
                            applyFinalKey = tokenPlusKey[tempToken];

                            if(returnInfo.hasOwnPropety(applyFinalKey)){
                                cachedReturnInfo = Object.assign({}, cachedReturnInfo, {[applyString]:returnInfo[applyFinalKey]})
                            } else{
                                var code400InvalidQuery: InsightResponse = {
                                    code: 400,
                                    body: {"error": "malformed transformation"}
                                };
                                return reject(code400InvalidQuery)
                            }
                        }*/
                        //console.time("start Group")

                        //console.time("hashing")
                        //var finalHashed:any = new Map()
                        //console.timeEnd("hashing")
                        finalReturn = newThis.transformationQueryHelper(finalReturn, transformationGroup, newTransformationApply, applyExists, groupedApplyArray);
                        //console.timeEnd("start Group")
                        var singleReturnInfo;
                        var singleAppliedInfo;
                        var returnInfoKeys;
                        var newCache;
                        var tempFinal = finalReturn;
                        finalReturn = []
                        for(let x in tempFinal){
                            try {
                                singleReturnInfo = JSON.parse(x);
                            }catch(err){
                                Log.info("Return Info invalid JSON parsing")
                                var code400InvalidQuery: InsightResponse = {
                                    code: 400,
                                    body: {"error": "order error"}
                                };
                                return reject(code400InvalidQuery);
                            }
                            if(groupedApplyArray.length > 0) {
                                singleAppliedInfo = tempFinal[x]
                                singleAppliedInfo = newThis.finishApply(singleAppliedInfo)
                                singleReturnInfo = Object.assign(singleReturnInfo, singleAppliedInfo);
                            }

                            /**if(isNullOrUndefined(singleReturnInfo)){
                                Log.info(JSON.stringify(x));
                            }*/
                            for (let x in columns) {

                                singleColumnKey = columns[x].toString()



                                if (singleReturnInfo.hasOwnProperty(singleColumnKey)) {

                                    newCache = Object.assign({}, newCache, {[singleColumnKey]: singleReturnInfo[singleColumnKey]});



                                } else {


                                    //cachedReturnInfo = Object.assign({}, cachedReturnInfo, {[singleColumnKey]: returnInfo[singleColumnKey]});
                                    //newCache = null;
                                    singleReturnInfo = null;

                                    //returnInfo = returnInfo
                                    //returnInfo = Object.assign({}, returnInfo, atomicReturnInfo);
                                    //Log.info(returnInfo);

                                    //should look like {"courses_avg":95, "courses_instructor":"bleh"]
                                }

                            }
                            finalReturn.push(newCache);
                        }
                    }

                    //console.time("sort through result")
                    if(!(isUndefined(order))) {
                        if(finalReturn.length == 0){
                            order = order;
                        }else {
                            //TODO: check for new ORDER
                            if (typeof order == "string") {
                                if (columns.includes(order)) {
                                    /** (validProjectKey[0].endsWith("_fullname") || validProjectKey[0].endsWith("_shortname") ||
                                     validProjectKey[0].endsWith("_number") || validProjectKey[0].endsWith("_name")|| validProjectKey[0].endsWith("_address")) */
                                    if (typeof finalReturn[0][order] == "number" || order.endsWith("_avg") || order.endsWith("_pass") || order.endsWith("_fail") || order.endsWith("_audit") || order.endsWith("_year")
                                        || order.endsWith("_lat") || order.endsWith("_lon") || order.endsWith("_seats") || order.endsWith("_sectionsize")) {

                                        finalReturn = finalReturn.sort(function (a: any, b: any) {
                                            return a[order] - b[order];
                                        });

                                    } else if (typeof finalReturn[0][order] == "string" || order.endsWith("_dept") || order.endsWith("_id") || order.endsWith("_instructor") || order.endsWith("_fullname") || order.endsWith("furniture")
                                        || order.endsWith("_shortname") || order.endsWith("_number") || order.endsWith("_name") || order.endsWith("_address") || order.endsWith("_type") || order.endsWith("_href")
                                        || order.endsWith("_uuid") || order.endsWith("_distance")) {
                                        finalReturn = finalReturn.sort(function (a: any, b: any) {
                                            var nameA = a[order].toUpperCase(); // ignore upper and lowercase
                                            var nameB = b[order].toUpperCase(); // ignore upper and lowercase
                                            if (nameA < nameB) {
                                                return -1;
                                            } else if (nameA > nameB) {
                                                return 1;
                                            } else
                                                return 0;
                                        });


                                    } /**else if (order.endsWith("_uuid")) {
                                    finalReturn = finalReturn.sort(function (a:any, b:any) {
                                        var numA = Number(a[order]); // ignore upper and lowercase
                                        var numB = Number(b[order]); // ignore upper and lowercase
                                        if (nameA < nameB) {
                                    return -1;
                                } else if (nameA > nameB) {
                                    return 1;
                                } else
                                         return 0;
                                        return numA - numB;
                                    });


                                }*/ else {
                                        var code400InvalidQuery: InsightResponse = {
                                            code: 400,
                                            body: {"error": "order error"}
                                        };
                                        return reject(code400InvalidQuery);
                                    }
                                } else {
                                    var code400InvalidQuery: InsightResponse = {
                                        code: 400,
                                        body: {"error": "order not in column"}
                                    };
                                    return reject(code400InvalidQuery);
                                }
                                //console.timeEnd("sort through result")
                            } else {
                                //console.time("sort through new order")
                                var orderKeys = Object.keys(order);
                                var dir: any = order[orderKeys[0]];
                                var keysArray: any = order[orderKeys[1]];
                                var tempSortResult;

                                for (let x in keysArray) {
                                    if (columns.includes(keysArray[x])) {
                                        continue;
                                    } else {
                                        var code400InvalidQuery: InsightResponse = {
                                            code: 400,
                                            body: {"error": "order not in column"}
                                        };
                                        return reject(code400InvalidQuery);
                                    }
                                }
                                /**if (keysArray[0].endsWith("_uuid")) {
                                var tempKeysArray = keysArray.slice();
                                finalReturn = finalReturn.sort(function (a:any, b:any) {
                                    var numA = Number(a[keysArray[0]]); // ignore upper and lowercase
                                    var numB = Number(b[keysArray[0]]); // ignore upper and lowercase

                                    if(dir == "DOWN") {
                                        //tempSortResult = numB - numA;
                                        tempSortResult = numB - numA

                                        while(tempSortResult == 0){
                                            for(let x in keysArray){
                                                numA = Number(a[keysArray[x]])
                                                numB = Number(b[keysArray[x]])
                                                tempSortResult = numB - numA;
                                            }
                                        }
                                        return tempSortResult
                                        if(tempSortResult == 0){

                                            tempKeysArray.shift()
                                            tempSortResult = newThis.breakingTies(b, a, tempKeysArray, dir)
                                            return tempSortResult
                                        }else return tempSortResult
                                    }else if(dir == "UP"){
                                        tempSortResult = numA - numB;

                                        while(tempSortResult == 0){
                                            for(let x in keysArray){
                                                numA = Number(a[keysArray[x]])
                                                numB = Number(b[keysArray[x]])
                                                tempSortResult = numA - numB;
                                            }
                                        }
                                        return tempSortResult
                                        if(tempSortResult == 0){
                                            tempKeysArray.shift()
                                            tempSortResult = newThis.breakingTies(a, b, tempKeysArray, dir)
                                            return tempSortResult
                                        }else return tempSortResult;
                                    }
                                });

                                //TODO: sort using apply key now, check that it exists in APPLY and COLUMNS first
                            }*/
                                if (typeof (typeof finalReturn[0][keysArray[0]]) == "string" || typeof finalReturn[0][keysArray[0]] == "number"){
                                    finalReturn = newThis.newD3Order(dir, keysArray, finalReturn)
                                }
                                else {

                                    var code400InvalidQuery: InsightResponse = {
                                        code: 400,
                                        body: {"error": "order error"}
                                    };
                                    return reject(code400InvalidQuery);
                                }

                                //console.timeEnd("sort through new order")
                            }
                        }
                    }//console.timeEnd("sort through result")

                    // TODO: then enclose it with {render:"TABLE", result:[{returnInfo}, {data4}]}

                    lmaoWeDone = {render: table, result: finalReturn}

                    var code200Done: InsightResponse = {code: 200, body: lmaoWeDone}
                    return resolve(code200Done);





                } else{
                    var code400InvalidQuery:InsightResponse = {code:400, body:{"error":"empty dataset"}};
                    return reject(code400InvalidQuery);
                }




            } else if(yesOrNo == "false"){
                var unloadedDatasets = [];
                for(let x in dataSetId){
                    try {
                        var oneDataset = dataSetId[x]
                        //console.time("testing read file filters general")
                        contentDatasetResult = fs.readFileSync(oneDataset, "utf8")
                        //console.timeEnd("testing read file filters general")

                    }
                    catch(err){
                        if (err.code === 'ENOENT') {
                            unloadedDatasets.push(oneDataset);
                        } else if(err.code === 'EISDIR'){
                            unloadedDatasets.push(oneDataset)

                        } else{
                            unloadedDatasets.push(oneDataset)
                        }
                    }
                }
                if(unloadedDatasets.length > 0) {
                    var code424InvalidQuery: InsightResponse = {code: 424, body: {'missing': unloadedDatasets}};
                    return reject(code424InvalidQuery);
                } else{
                    var code400InvalidQuery:InsightResponse = {code:400, body:{"error":"invalid query"}};
                    return reject(code400InvalidQuery);
                }

            }
            else{
                var code400InvalidQuery:InsightResponse = {code:400, body:{"error":"invalid query"}};
                return reject(code400InvalidQuery);
            }
        });

    }

    //perform query


    //Helper function in main queryRequest()

    newD3Order(dir:string, keysArray:any[], finalReturn:any):any{
        var newThis = this;
        var tempSortResult;


            finalReturn = finalReturn.sort(function (a: any, b: any) {
                return newThis.innerOrderTwoElements(dir, keysArray, a, b)
            });
            return finalReturn;

        }

    innerOrderTwoElements(dir:string, keysArray:any[], a:any, b:any):any{
        var tempSortResult;
        if (typeof a[keysArray[0]] == "number" && typeof a[keysArray[0]] == "number") {
            if (dir == "DOWN") {
                tempSortResult = b[keysArray[0]] - a[keysArray[0]];

                let x = 0;
                while (tempSortResult == 0 && Number(x) < keysArray.length) {
                    if(typeof a[keysArray[x]] == "string" && typeof a[keysArray[x]] == "string"){
                        var newKeysArray = keysArray.slice(x);
                        return this.innerOrderTwoElements(dir, newKeysArray, a, b)
                    }else {
                        tempSortResult = b[keysArray[x]] - a[keysArray[x]];
                        x++;
                    }
                }

                return tempSortResult;
            } else if (dir == "UP") {
                tempSortResult = a[keysArray[0]] - b[keysArray[0]];

                let x = 0;
                while (tempSortResult == 0 && Number(x) < keysArray.length) {
                    if(typeof a[keysArray[x]] == "string" && typeof a[keysArray[x]] == "string"){
                        var newKeysArray = keysArray.slice(x);
                        return this.innerOrderTwoElements(dir, newKeysArray, a, b)
                    }else {
                        tempSortResult = a[keysArray[x]] - b[keysArray[x]];
                        x++;
                    }
                }
                return tempSortResult;
            }
        }
        else if (typeof a[keysArray[0]] == "string" && typeof a[keysArray[0]] == "string") {
            // var x = 0;

            if (dir == "DOWN") {

                //Log.info(JSON.stringify(a));
                //Log.info(JSON.stringify(keysArray[0]))

                var nameA = a[keysArray[0]].toUpperCase(); // ignore upper and lowercase
                var nameB = b[keysArray[0]].toUpperCase(); // ignore upper and lowercase
                if (nameB < nameA) {
                    return -1;
                } else if (nameB > nameA) {
                    return 1;
                } else {
                    let x = 0;
                    while (nameB == nameA && Number(x) < keysArray.length) {
                        if(typeof a[keysArray[x]] == "number" && typeof a[keysArray[x]] == "number"){
                            var newKeysArray = keysArray.slice(x);
                            return this.innerOrderTwoElements(dir, newKeysArray, a, b)
                        }else {
                            nameA = a[keysArray[x]].toUpperCase(); // ignore upper and lowercase
                            nameB = b[keysArray[x]].toUpperCase(); // ignore upper and lowercase
                            x++
                        }
                    }
                    if (nameB < nameA) {
                        return -1;
                    } else {
                        return 1;
                    }
                    //return 0
                }
            } else if (dir == "UP") {
                var nameA = a[keysArray[0]].toUpperCase(); // ignore upper and lowercase
                var nameB = b[keysArray[0]].toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                } else if (nameA > nameB) {
                    return 1;
                } else {
                    let x = 0;
                    while (nameB == nameA && Number(x) < keysArray.length) {
                        if(typeof a[keysArray[x]] == "number" && typeof a[keysArray[x]] == "number"){
                            var newKeysArray = keysArray.slice(x);
                            return this.innerOrderTwoElements(dir, newKeysArray, a, b)
                        }else {
                            nameA = a[keysArray[x]].toUpperCase(); // ignore upper and lowercase
                            nameB = b[keysArray[x]].toUpperCase(); // ignore upper and lowercase
                            x++
                        }
                    }
                    if (nameB > nameA) {
                        return -1;
                    } else {
                        return 1;
                    }
                    //return 0
                }


            }
        }
    }

    getDistanceFromLatLonInKm(lat1:number,lon1:number,lat2:number,lon2:number):number {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2-lon1);
        var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d:number = R * c; // Distance in km
        return Number(d.toFixed(3));
    }

    deg2rad(deg:number):number {
        return deg * (Math.PI/180)
    }

    finishApply(returnInfo:any):any{
        var cachedInfo;
        var singleInfo:any;
        var infoKeys;
        var valueArray;
        var newReturnInfo:any = {}
        var sum = returnInfo[0]
        var size = returnInfo["has AVG"]
        var average = sum/size

        for(let x in returnInfo){
            //singleInfo= {[x]:returnInfo[x]}
            singleInfo = x
            infoKeys = Object.keys(singleInfo)[0]
            valueArray = returnInfo[x]
            if(valueArray instanceof Array){
                if(x.endsWith("MAX")){
                    newReturnInfo[x.replace("MAX", "")] = this.returnMax(valueArray)
                }else if(x.endsWith("MIN")){
                    newReturnInfo[x.replace("MIN", "")] = this.returnMin(valueArray)
                }else if(x.endsWith("SUM")){
                    newReturnInfo[x.replace("SUM", "")] = this.returnSum(valueArray)
                }else if(x.endsWith("AVG")){
                    newReturnInfo[x.replace("AVG", "")] = this.returnAVG(valueArray)
                }else if(x.endsWith("COUNT")){
                    newReturnInfo[x.replace("COUNT", "")] = this.returnCOUNT(valueArray)
                }
            }

        } return newReturnInfo;

    }

    transformationQueryHelper(finalReturnInfo:any, transformationGroup:any, transformationApply:any, applyExists:any, groupedApplyArray:any ):any{
        var transformReturnInfo:any;
        var newTransformReturnInfo:any;
        let groupObjectArray:any = {};
        var newValue = '';
        var groupedApplyColumns;
        var uuidIndex;
        var matchIndex;
        var singleGroup;
        var newTransformGroup = transformationGroup.slice();
        var concatenatedKey:any;
        var mapElement:any;

        var applyString;
        var applyKey;


        for (let x in finalReturnInfo) {
            try {
                transformReturnInfo = finalReturnInfo[x];
                newTransformReturnInfo = null;

                //console.timeEnd("new transformation")

                concatenatedKey = JSON.stringify(transformReturnInfo);

                //console.time("new Apply")
                if (groupedApplyArray.length == 0) {
                    groupedApplyColumns = ""
                }
                groupedApplyColumns = groupedApplyArray[x];

                //console.time("new Apply")
                if (Number(x) == 0) {
                    //transformReturnInfo = {[concatenatedKey]:groupedApplyColumns}

                    groupObjectArray = Object.assign({}, groupObjectArray, {[concatenatedKey]: groupedApplyColumns});
                } else {
                    if (transformationGroup.includes("courses_uuid")) {
                        uuidIndex = transformationGroup.indexOf("courses_uuid")
                        newTransformGroup.splice(uuidIndex, 1);

                    }


                    if (newTransformGroup.length == 0) {
                        //transformReturnInfo = {[concatenatedKey]:groupedApplyColumns}
                        groupObjectArray = Object.assign(groupObjectArray, {[concatenatedKey]: groupedApplyColumns});
                    } else {


                        /**
                         var singleGroupedElement:any;
                         for(let x in groupObjectArray){
                            singleGroupedElement = groupObjectArray[x];
                            if(newTransformGroup.every(function (singleGroup: any) {
                                newValue = transformReturnInfo[singleGroup];
                                return newValue == singleGroupedElement[singleGroup]

                            })){
                                matchIndex = Number(x);
                            }
                        }*/

                        /**if(groupObjectArray.length == 15){
                            Log.info("conticnue")
                        }*/

                        /**
                         matchIndex = groupObjectArray.findIndex(function (singleGroupedElement: any) {
                        return newTransformGroup.every(function (singleGroup: any) {
                            newValue = transformReturnInfo[singleGroup];
                            return newValue == singleGroupedElement[singleGroup]

                            })
                        });*/
                        //console.time("concat")
                        /**for(let x in newTransformGroup){
                            newValue = newValue.concat(JSON.stringify(newTransformGroup[x]));
                        }*/
                        //console.timeEnd("concat")
                        //console.time("group check")

                        if (typeof (groupObjectArray[concatenatedKey]) != "undefined") {
                            //console.timeEnd("group check")
                            //console.time("group update")
                            groupObjectArray[concatenatedKey] = this.groupQueryHelper(groupObjectArray[concatenatedKey], groupedApplyColumns, transformationApply)
                            //console.timeEnd("group update")
                        } else {
                            //console.time("add group")
                            groupObjectArray = Object.assign(groupObjectArray, {[concatenatedKey]: groupedApplyColumns});
                            //console.timeEnd("add group")
                        }

                        /**if(newTransformReturnInfo == newValue){
                        //transformReturnInfo = {[concatenatedKey]:groupedApplyColumns}
                        console.time("group query")
                        groupObjectArray[newValue] = this.groupQueryHelper(groupObjectArray[newValue], groupedApplyColumns, transformationApply)
                        console.timeEnd("group query")
                        //groupObjectArray.push(transformReturnInfo);
                    }else{
                        transformReturnInfo = {[concatenatedKey]:groupedApplyColumns}
                        groupObjectArray.push(transformReturnInfo);
                    }*/
                    }
                }


                /**
                 if (matchIndex >= 0) {
                    transformReturnInfo = Object.assign({}, transformReturnInfo, groupedApplyColumns)
                    groupObjectArray[matchIndex] = this.groupQueryHelper(groupObjectArray[matchIndex], transformReturnInfo, transformationApply)

                } else if(matchIndex == -1){
                    transformReturnInfo = Object.assign({}, transformReturnInfo, groupedApplyColumns)
                    groupObjectArray.push(transformReturnInfo);
                }else{
                    groupObjectArray = groupObjectArray
                }*/

            }
            catch(err){
                Log.info(JSON.stringify(x))
            }
        }


        return groupObjectArray;
    }

    groupQueryHelper(returnInfo:any, groupedApplyArray:any, transformationApply:any){

        var innerArray = new Array();
        var tempGroupedArray = new Array()
        //var resultArray


        for(let x in groupedApplyArray){
            innerArray = returnInfo[x]
            tempGroupedArray = groupedApplyArray[x]
            if(typeof innerArray != "undefined"){

                returnInfo[x] = innerArray.concat(tempGroupedArray);
                groupedApplyArray[x] = tempGroupedArray;
                //returnInfo[x] = innerArray.push.apply(innerArray, groupedApplyArray[x]);
                //innerArray = [];
            }else{
                x = x;
            }
        }return returnInfo;


        /**
        for(let x in transformationApply){
            singleApply = transformationApply[x]
            applyKey = Object.keys(singleApply)[0]
            applyToken = Object.keys(singleApply[applyKey])[0]
            console.time("search group")
            if(groupedApplyArray[applyKey][0] == returnInfo[applyKey][0]){
                returnInfo[applyKey].shift()
            }
            console.timeEnd("search group")

            console.time("update group")
            groupedApplyArray[applyKey] = groupedApplyArray[applyKey].concat(returnInfo[applyKey])
            console.timeEnd("update group") */

            /**if(groupReturnInfo[applyKey][0] == returnInfo[applyKey][0]){
                returnInfo[applyKey].shift();
            }

            groupReturnInfo[applyKey] = groupReturnInfo[applyKey].concat(returnInfo[applyKey])*/

            /**if(applyToken == "MAX"){
                groupReturnInfo[applyKey] = this.returnMax(groupReturnInfo[applyKey], returnInfo[applyKey])
            }else if(applyToken == "MIN"){
                groupReturnInfo[applyKey] = this.returnMin(groupReturnInfo[applyKey], returnInfo[applyKey])
            }else if(applyToken == "SUM"){
                groupReturnInfo[applyKey] = this.returnSum(groupReturnInfo[applyKey], returnInfo[applyKey])
            }else if(applyToken == "COUNT"){
                groupReturnInfo[applyKey] = this.returnCOUNT(groupReturnInfo[applyKey], returnInfo[applyKey])
            }else if(applyToken == "AVG"){
                groupReturnInfo = this.returnAVG(groupReturnInfo[applyKey], returnInfo[applyKey])
            }*/

        //}return groupedApplyArray;
    }

    returnMax(valueArray:any):any{
        //valueArray.shift()

        var max = valueArray.reduce(function(a:any, b:any) {
            return Math.max(a, b);
        });
        return max
    }

    returnMin(valueArray:any):any{
        //valueArray.shift()

        var min = valueArray.reduce(function(a:any, b:any) {
            return Math.min(a, b);
        });
        return min
    }

    returnSum(valueArray:any):any{
        //valueArray.shift()
        var sum = valueArray.reduce(function (a:any, b:any) {
            return a + b;
        });
        return sum
    }

    returnAVG(valueArray:any):any{

        //valueArray.shift();
        var groupedSum = 0;
        var averageCounter;
        var oneNumber;
        for(let x in valueArray){
            if(Number(x) == 0){
                oneNumber = valueArray[x] * 10;
                oneNumber = Number(oneNumber.toFixed(0));
                groupedSum = oneNumber;
            }else {
                oneNumber = valueArray[x] * 10;
                oneNumber = Number(oneNumber.toFixed(0));
                groupedSum += oneNumber;
            }
        }
        groupedSum = groupedSum/(Number(valueArray.length));
        groupedSum = groupedSum/10;
        groupedSum = Number(groupedSum.toFixed(2));
        return groupedSum
    }

    returnCOUNT(valueArray:any):any{
        //valueArray.shift();
        valueArray = valueArray.filter (function (value:any, index:any, array:any) {
            return array.indexOf (value) == index;
        });
        return valueArray.length;
    }


    applyObjects(transformationApply:any, returnInfo:any):any{
        var applyString;
        var singleApply;
        var tokenPlusKey;
        var tempToken;
        var applyFinalKey;
        var returnApply = {};
        for(let x in transformationApply){

            applyString = Object.keys(transformationApply[x])[0]
            singleApply = transformationApply[x];
            tokenPlusKey = singleApply[applyString]
            tempToken = Object.keys(tokenPlusKey)[0];
            applyFinalKey = tokenPlusKey[tempToken];

            /**
             if(tempToken == "AVG"){
                returnApply = Object.assign({}, returnApply, {[applyString]:[returnInfo[applyFinalKey], 1]})
            }*/

            //returnApply.set(applyString.concat(tempToken), [returnInfo[applyFinalKey]]);
            returnApply = Object.assign({}, returnApply, {[applyString.concat(tempToken)]:[returnInfo[applyFinalKey]]})
        } return returnApply; /**else{
                var code400InvalidQuery: InsightResponse = {
                    code: 400,
                    body: {"error": "malformed transformation"}
                };
                return reject(code400InvalidQuery)
            }*/
    }




    applyHasColumn(Apply:any, columnsKey:any):any{
        return Apply.filter(function(applyKey:any){
            var tempApplyString = Object.keys(applyKey)[0]
            if(columnsKey == tempApplyString){
                return applyKey;
            }
        })
    }

    breakingTies(a:any, b:any, sortArray:any, direction:string):any{ //did not implement sectionsize
        var tempSortResult;

        for(let x in sortArray){
            var tempsortArray;
            if (sortArray[x].endsWith("_avg") || sortArray[x].endsWith("_pass") || sortArray[x].endsWith("_fail") || sortArray[x].endsWith("_audit") || sortArray[x].endsWith("_year")
                || sortArray[x].endsWith("_lat") || sortArray[x].endsWith("_lon") || sortArray[x].endsWith("_seats")) {
                if (direction == "UP") {
                    tempSortResult = a[sortArray[x]] - b[sortArray[x]];
                    if (tempSortResult == 0) {
                        tempsortArray = sortArray.shift()
                        return this.breakingTies(a[sortArray[x]], b[sortArray[x]], tempsortArray, direction)
                    } else return tempSortResult
                }
                else if (direction == "DOWN") {
                    tempSortResult = b[sortArray[x]] - a[sortArray[x]];
                    if (tempSortResult == 0) {
                        tempsortArray = sortArray.shift()
                        return this.breakingTies(b[sortArray[x]], a[sortArray[x]], tempsortArray, direction)
                    } else return tempSortResult
                }
            }
            else if (sortArray[x].endsWith("_dept") || sortArray[x].endsWith("_id") || sortArray[x].endsWith("_instructor") || sortArray[x].endsWith("_fullname")
                || sortArray[x].endsWith("_shortname") || sortArray[x].endsWith("_number") || sortArray[x].endsWith("_name") || sortArray[x].endsWith("_address")
                || sortArray[x].endsWith("_type") || sortArray[x].endsWith("_href")) {
                if(direction == "UP") {
                    var nameA = a[sortArray[x]].toUpperCase(); // ignore upper and lowercase
                    var nameB = b[sortArray[x]].toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    } else if (nameA > nameB) {
                        return 1;
                    } else {
                        tempsortArray = sortArray.shift()
                        return this.breakingTies(a[sortArray[x]], b[sortArray[x]], tempsortArray, direction);
                    }
                }else if(direction == "DOWN"){
                    var nameA = a[sortArray[x]].toUpperCase(); // ignore upper and lowercase
                    var nameB = b[sortArray[x]].toUpperCase(); // ignore upper and lowercase
                    if (nameA > nameB) {
                        return -1;
                    } else if (nameA < nameB) {
                        return 1;
                    } else {
                        tempsortArray = sortArray.shift()
                        return this.breakingTies(b[sortArray[x]], a[sortArray[x]], tempsortArray, direction);
                    }
                }



            } else if (sortArray[x].endsWith("_uuid")) {
                if(direction == "UP") {
                    var numA = Number(a[sortArray[x]]); // ignore upper and lowercase
                    var numB = Number(b[sortArray[x]]); // ignore upper and lowercase
                    tempSortResult = numA - numB;

                    if (tempSortResult == 0) {
                        tempsortArray = sortArray.shift()
                        return this.breakingTies(a, b, tempsortArray, direction)
                    } else return tempSortResult;
                }else if(direction == "DOWN"){
                    var numA = Number(a[sortArray[x]]); // ignore upper and lowercase
                    var numB = Number(b[sortArray[x]]); // ignore upper and lowercase
                    tempSortResult = numB - numA;

                    if (tempSortResult == 0) {
                        tempsortArray = sortArray.shift()
                        return this.breakingTies(b, a, tempsortArray, direction)
                    } else return tempSortResult;
                }



            }
        }
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
        }else if(databaseKey == "Course"){
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
                /**if(resultOfWhere.length == 1){
                    newFilter = resultOfWhere[x];
                    newKeys = Object.keys(newFilter);
                    newResult = newFilter[newKeys[0]];
                    returnInfo = this.filterQueryRequest(returnInfo, newResult, newKeys);
                }*/
                if(Number(x) == 0){
                    newFilter = resultOfWhere[x];
                    newKeys = Object.keys(newFilter);
                    newResult = newFilter[newKeys[0]];
                    returnInfo = this.filterQueryRequest(returnInfo, newResult, newKeys);

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
            var accumulatedReturn = {};
            var returnInfoKeys:any[] = []
            var returnInfo2Keys:any[] = []

            for(let x in resultOfWhere){

                if(Number(x) == 0){
                    newFilter = resultOfWhere[x];
                    newKeys = Object.keys(newFilter);
                    newResult = newFilter[newKeys[0]];
                    tempReturnInfo = this.filterQueryRequest(returnInfo, newResult, newKeys);
                    //console.time("start object keys")
                    if(!isNullOrUndefined(tempReturnInfo)) {
                        accumulatedReturn = tempReturnInfo
                    }
                    //console.timeEnd("start object keys")

                    /**if(resultOfWhere.length == 1){
                        returnInfo = tempReturnInfo
                    }else{
                        tempReturnInfo = tempReturnInfo
                    }*/
                }else {
                    tempReturnInfo = this.filterQueryRequest(returnInfo, newResult, newKeys);
                    newFilter = resultOfWhere[x];
                    newKeys = Object.keys(newFilter);
                    newResult = newFilter[newKeys[0]];
                    tempReturnInfo2 = this.filterQueryRequest(returnInfo, newResult, newKeys);
                    returnInfoKeys = Object.keys(tempReturnInfo);
                    returnInfo2Keys = Object.keys(tempReturnInfo2);
                    if(tempReturnInfo2.length == 0 && returnInfoKeys.length > 0){
                        accumulatedReturn = this.mergeDeDuplicate(accumulatedReturn, tempReturnInfo);
                    }else if(tempReturnInfo.length == 0 && returnInfo2Keys.length > 0){

                        accumulatedReturn = this.mergeDeDuplicate(accumulatedReturn, tempReturnInfo2);
                    }else if(tempReturnInfo.length == 0 && tempReturnInfo2.length == 0){
                        continue;
                    }else {
                        if(Object.keys(accumulatedReturn).length == 0){
                            accumulatedReturn = tempReturnInfo
                            accumulatedReturn = this.mergeDeDuplicate(accumulatedReturn, tempReturnInfo2)
                        }else {
                            accumulatedReturn = this.mergeDeDuplicate(accumulatedReturn, tempReturnInfo);
                            accumulatedReturn = this.mergeDeDuplicate(accumulatedReturn, tempReturnInfo2)
                        }
                    }

                }
            }//console.timeEnd("Go through OR")
            returnInfo = accumulatedReturn
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

            if(resultKeyArray[0] == "AND" || resultKeyArray[0] == "OR"){
                for(let x in newResult) {
                    sortKey = this.getFilterArray(newResult[x])
                    returnInfo = this.isNOT(returnInfo, tempReturnInfo, sortKey, resultKeyArray);
                }
            }
            else if(tempSortKey[0] == "GT" || tempSortKey[0] == "LT" || tempSortKey[0] == "EQ" || tempSortKey[0] == "IS"){
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
        if(Object.keys(theWaitingKeyValue).length == 0){
            theWaitingKeyValue = theIteratedKeyValue
            return theWaitingKeyValue;
        }
        for(let x in theIteratedKeyArray){
            var theIteratedKey = theIteratedKeyArray[x];
            var theIteratedValue = theIteratedKeyValue[theIteratedKey];
            if(theWaitingKeyValue.hasOwnProperty(theIteratedKey) && theWaitingKeyValue[theIteratedKey] == theIteratedValue){
                //Log.info("merging duplicates"+theWaitingKeyValue.toString()+theIteratedKeyValue.toString())
            } else {
                try {
                    theWaitingKeyValue.assign(theWaitingKeyValue, {[theIteratedKey]: theIteratedValue});
                }catch(err){

                    Log.info(JSON.stringify(theWaitingKeyValue));
                }
            }

        } return theWaitingKeyValue
    }

    isLessThan(returnInfo:any, resultKeyArray:any, keys:string[], sortVal:any){
        //resultKeyArray[0] is basically "courses_avg"
        //returnInfo is now {atomicReturnInfo, atomicReturnInfo}
        var sortKey = resultKeyArray[0]
        var returnInfoKeyArray = Object.keys(returnInfo);
        var distance:number;
        for(let x in returnInfoKeyArray){
            var tempAtomicKey = returnInfoKeyArray[x]
            var tempAtomicValue = returnInfo[tempAtomicKey];
            if(sortKey == "courses_sectionsize"){
                tempAtomicValue = Number(returnInfo["courses_pass"]) + Number(returnInfo["courses_fail"])
                if(isNullOrUndefined(returnInfo[sortKey])) { //first time

                    if (isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue < sortVal) {
                        returnInfo[sortKey] = tempAtomicValue
                    } else {
                        returnInfo = []
                    }
                }else{

                    if (isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue < sortVal) {
                        returnInfo = returnInfo
                    } else {
                        returnInfo = []
                    }
                }
            }if(sortKey == "rooms_distance"){
                tempAtomicValue = this.getDistanceFromLatLonInKm(sortVal[1], sortVal[2], Number(returnInfo["rooms_lat"]), Number(returnInfo["rooms_lon"]))
                if(isNumber(sortVal[3])  && isNumber(tempAtomicValue) && tempAtomicValue < sortVal[3]){
                    if(isNullOrUndefined(returnInfo[sortKey])){
                        returnInfo[sortKey] = tempAtomicValue;
                    }else returnInfo = returnInfo;
                }
            }else
            if(isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue < sortVal && sortKey == tempAtomicKey){
                returnInfo = returnInfo
            } else if(isNumber(sortVal) && isNumber(tempAtomicValue) && sortKey == tempAtomicKey){
                returnInfo = []
            } else{
                returnInfo = returnInfo
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
            if(sortKey == "courses_sectionsize"){
                tempAtomicValue = Number(returnInfo["courses_pass"]) + Number(returnInfo["courses_fail"])
                if(isNullOrUndefined(returnInfo[sortKey])) { //first time

                    if (isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue > sortVal) {
                        returnInfo[sortKey] = tempAtomicValue
                    } else {
                        returnInfo = []
                    }
                }else{

                    if (isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue > sortVal) {
                        returnInfo = returnInfo
                    } else {
                        returnInfo = []
                    }
                }
            }if(sortKey == "rooms_distance"){
                tempAtomicValue = this.getDistanceFromLatLonInKm(sortVal[1], sortVal[2], Number(returnInfo["rooms_lat"]), Number(returnInfo["rooms_lon"]))
                if(isNumber(sortVal[3])  && isNumber(tempAtomicValue) && tempAtomicValue > sortVal[3]){
                    if(isNullOrUndefined(returnInfo[sortKey])){
                        returnInfo[sortKey] = tempAtomicValue;
                    }else returnInfo = returnInfo;
                }
            }else
            if(isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue > sortVal && sortKey == tempAtomicKey){
                returnInfo = returnInfo
            } else if(isNumber(sortVal) && isNumber(tempAtomicValue) && sortKey == tempAtomicKey){
                returnInfo = []
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
            if(sortKey == "courses_sectionsize"){
                tempAtomicValue = Number(returnInfo["courses_pass"]) + Number(returnInfo["courses_fail"])
                if(isNullOrUndefined(returnInfo[sortKey])) { //first time

                    if (isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue == sortVal) {
                        returnInfo[sortKey] = tempAtomicValue
                    } else {
                        returnInfo = []
                    }
                }else{

                    if (isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue == sortVal) {
                        returnInfo = returnInfo
                    } else {
                        returnInfo = []
                    }
                }
            }if(sortKey == "rooms_distance"){
                tempAtomicValue = this.getDistanceFromLatLonInKm(sortVal[1], sortVal[2], Number(returnInfo["rooms_lat"]), Number(returnInfo["rooms_lon"]))
                if(isNumber(sortVal[3])  && isNumber(tempAtomicValue) && tempAtomicValue == sortVal[3]){
                    if(isNullOrUndefined(returnInfo[sortKey])){
                        returnInfo[sortKey] = tempAtomicValue;
                    }else returnInfo = returnInfo;
                }
            }else
            if (isNumber(sortVal) && isNumber(tempAtomicValue) && tempAtomicValue == sortVal && sortKey == tempAtomicKey) {
                returnInfo = returnInfo
            } else if(isNumber(sortVal) && isNumber(tempAtomicValue) && sortKey == tempAtomicKey){
                returnInfo = []
            } else {
                returnInfo = returnInfo
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
                returnInfo = []
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
        var columnsValidKeyArray:any; //returns the array of Valid Keys assigned to COLUMNS
        var orderValidKey; //returns the single valid key assigned to ORDER
        var newOrderKeys;
        var direction;
        var newOrderArray;
        var Table; //returns TABLE from VIEW
        var Transformation:any;
        var transformationExists;
        var applyExists;
        var invalidIdArray = new Array; //returns an array of id in query that do not exist
        var invalidIdLists;
        var isOneDataset:any = {"true":invalidIdArray}; //{boolean:invalidDataset[]}
        try{
            //var tempJSON = JSON.parse(query);
            var temp = JSON.stringify(query);
            JSON.parse(temp);
        }catch(err){
            return false
        }

        if(keyArray[0] == "WHERE" && keyArray[1] == "OPTIONS"){ //checks if outermost keys are WHERE and OPTIONS

            Where = keyArray[0]; //gets "WHERE"
            Options = keyArray[1]; //gets"OPTIONS"
            Transformation = query[keyArray[2]]
            filter = query[Where]; //returns content of FILTER

            if(!isUndefined(Transformation)){
                transformationExists = true;
                if(!isNullOrUndefined(Transformation["APPLY"])) {
                    if (Transformation["APPLY"].length > 0) {
                        applyExists = true;
                    }
                }

            }

            if(Object.keys(filter).length != 0){ //check if FILTER is empty
                isOneDataset = this.hasFilter(filter, invalidIdArray, isOneDataset);
            }


            if(isOneDataset != false) { //check if FILTER is valid, needed as FILTER is recursively nested && invalidIdArray.length == 0
                optionsValue = query[Options]; //gets all values from OPTIONS
                columnsEtcKey = Object.keys(optionsValue); //gets all the "key" within the value from OPTIONS, such as COLUMNS and etc...
                if((columnsEtcKey.length == 3 && columnsEtcKey[0] == "COLUMNS" && columnsEtcKey[1] == "ORDER" && columnsEtcKey[2] == "FORM") ||
                    (columnsEtcKey.length == 2 && columnsEtcKey[0] == "COLUMNS" && columnsEtcKey[1] == "FORM")){
                    columnsValidKeyArray = optionsValue[columnsEtcKey[0]] //returns an a possible array of valid keys in COLUMNS
                    if(columnsValidKeyArray.length == 0){
                        return false
                    }
                    for(let x in columnsValidKeyArray){
                        var yesOrNo = Object.keys(isOneDataset)[0];
                        var dataSet = isOneDataset[yesOrNo];

                        if(typeof columnsValidKeyArray[x] == "string" && (columnsValidKeyArray[x] == "courses_dept" || columnsValidKeyArray[x] == "courses_id"
                            || columnsValidKeyArray[x] == "courses_avg" || columnsValidKeyArray[x] == "courses_instructor"
                            || columnsValidKeyArray[x] == "courses_title" || columnsValidKeyArray[x] == "courses_pass"
                            || columnsValidKeyArray[x] == "courses_fail" || columnsValidKeyArray[x] == "courses_audit"
                            || columnsValidKeyArray[x] == "courses_uuid" || columnsValidKeyArray[x] == "courses_year" || columnsValidKeyArray[x] == "courses_sectionsize")){ //checks for valid keys
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
                            || columnsValidKeyArray[x] == "rooms_number"
                            || columnsValidKeyArray[x] == "rooms_name" || columnsValidKeyArray[x] == "rooms_address"
                            || columnsValidKeyArray[x] == "rooms_lat" || columnsValidKeyArray[x] == "rooms_lon"
                            || columnsValidKeyArray[x] == "rooms_seats" || columnsValidKeyArray[x] == "rooms_type" || columnsValidKeyArray[x] == "rooms_furniture"
                            || columnsValidKeyArray[x] == "rooms_href" || columnsValidKeyArray[x] == "rooms_distance")){ //checks for valid keys
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
                            || columnsValidKeyArray[x].endsWith("_years") || columnsValidKeyArray[x].endsWith("courses_sectionsize"))){

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
                            || columnsValidKeyArray[x].endsWith("_furniture") || columnsValidKeyArray[x].endsWith("_href") || columnsValidKeyArray[x].endsWith("_distance"))){

                            invalidIdLists = columnsValidKeyArray[x].split("_");


                            if(invalidIdArray.includes(invalidIdLists[0])){
                                invalidIdLists = [];
                            } else {
                                invalidIdArray.push(invalidIdLists[0]);
                            }isOneDataset = {"false":invalidIdArray}

                        }else if(typeof columnsValidKeyArray[x] == "string" && (!(columnsValidKeyArray[x].startsWith("courses")) || !(columnsValidKeyArray[x].startsWith("rooms"))) && columnsValidKeyArray[x].includes("_")){

                            invalidIdLists = columnsValidKeyArray[x].split("_");


                            if(invalidIdArray.includes(invalidIdLists[0])){
                                invalidIdLists = [];
                            } else {
                                invalidIdArray.push(invalidIdLists[0]);
                            }isOneDataset = {"false":invalidIdArray}

                        }else if(typeof columnsValidKeyArray[x] == "string" && !(columnsValidKeyArray[x].includes("_")) && applyExists == true){
                            continue;
                        }else
                            return false
                    } if(columnsEtcKey[1] == "ORDER") {
                        yesOrNo = Object.keys(isOneDataset)[0];
                        dataSet = isOneDataset[yesOrNo];
                        orderValidKey = optionsValue[columnsEtcKey[1]];//gets ORDER key
                        if(orderValidKey !== null && typeof orderValidKey === "object"){
                            var d3OrderObject = Object.keys(orderValidKey);
                            if(d3OrderObject.length == 2 && d3OrderObject[0] == "dir" && d3OrderObject[1] == "keys" && (typeof orderValidKey["dir"] == "string")
                            && orderValidKey["keys"] instanceof Array){
                                direction = orderValidKey["dir"]
                                keyArray = orderValidKey["keys"]
                                if(keyArray.length == 0 || !keyArray.every(function (singleKey) {
                                        return columnsValidKeyArray.includes(singleKey);
                                    })){
                                    return false
                                }else {
                                    if (direction == "UP" || direction == "DOWN") {

                                        if (keyArray.every(function (key: any): any {
                                                return columnsValidKeyArray.includes(key);
                                            })) {
                                            if (transformationExists == true) {
                                                isOneDataset = isOneDataset;
                                                if(applyExists != true){
                                                    for(let x in keyArray) {
                                                        isOneDataset = this.queryCheckingOrder(keyArray[x], yesOrNo, dataSet, invalidIdArray, applyExists);
                                                        if (isOneDataset == false) {
                                                            return false;
                                                        } else {
                                                            yesOrNo = Object.keys(isOneDataset)[0];
                                                            dataSet = isOneDataset[yesOrNo];

                                                            Table = optionsValue[columnsEtcKey[2]];
                                                            if (Table == "TABLE") { //if value of FORM is TABLE
                                                                return isOneDataset
                                                            } else return false;
                                                        }
                                                    }
                                                }
                                            } else {
                                                Table = optionsValue[columnsEtcKey[2]];
                                                if (Table == "TABLE") { //if value of FORM is TABLE
                                                    return isOneDataset
                                                } else return false;
                                            }
                                        } else return false;

                                    } else return false;
                                }
                            }else return false;
                        }else
                        if (columnsValidKeyArray.includes(orderValidKey)) {
                            isOneDataset = this.queryCheckingOrder(orderValidKey, yesOrNo, dataSet, invalidIdArray, applyExists);
                            if(isOneDataset == false){
                                return false;
                            }else {
                                yesOrNo = Object.keys(isOneDataset)[0];
                                dataSet = isOneDataset[yesOrNo];

                                if(transformationExists == true){
                                   isOneDataset = isOneDataset;
                                }else {
                                    Table = optionsValue[columnsEtcKey[2]];
                                    if (Table == "TABLE") { //if value of FORM is TABLE
                                        return isOneDataset
                                    } else return false;
                                }

                            }
                        } else return false

                    }else if(transformationExists == true){
                        isOneDataset = isOneDataset
                    } else {
                        Table = optionsValue[columnsEtcKey[1]];
                        if (Table == "TABLE") { //if value of FORM is TABLE
                            return isOneDataset;
                        } else return false;
                    }
                } else return false;

                //Transformers
                yesOrNo = Object.keys(isOneDataset)[0];
                dataSet = isOneDataset[yesOrNo];
                var group:any;
                var apply:any;
                var columnsApplyArray;
                var columnsGroupArray;
                if(Transformation.hasOwnProperty("GROUP") && Transformation.hasOwnProperty("APPLY") && Transformation["GROUP"] instanceof Array
                && Transformation["APPLY"] instanceof Array){
                    group = Transformation["GROUP"]
                    apply = Transformation["APPLY"]
                    if(group.length <= 0){
                        return false;
                    }else{
                        if(group.every(function (groupElement:any) {
                            return groupElement.includes("_")
                        })){
                            columnsGroupArray = columnsValidKeyArray.filter(function (singleColumn:any) {
                                return singleColumn.includes("_");
                            })

                            columnsApplyArray = columnsValidKeyArray.filter(function (singleColumn:any) {
                                return !singleColumn.includes("_");
                            })

                            if((columnsGroupArray.length + columnsApplyArray.length) == columnsValidKeyArray.length){
                                if(apply.length == 0){
                                    if(columnsApplyArray.length == 0){
                                        if(columnsGroupArray.every(function (columns:any) {
                                                return group.includes(columns)
                                            })){
                                            if(optionsValue["FORM"] == "TABLE"){
                                                return isOneDataset;
                                            }else return false;

                                        }else return false
                                    }else return false;
                                }else{

                                    var applyString;
                                    var tokenPlusKey;
                                    var applyToken;
                                    var applylittleKey;
                                    var applyStringKeyArray;

                                    let duplicate = new Set();

                                    var hasDuplicates = apply.some(function(currentObject:any) {
                                        return duplicate.size === duplicate.add(Object.keys(currentObject)[0]).size;
                                    });

                                    if(hasDuplicates){
                                        return false;
                                    }

                                   if(apply.every(function (applyKey:any) {
                                      applyStringKeyArray = Object.keys(applyKey);
                                      applyString = applyStringKeyArray[0]
                                      tokenPlusKey = applyKey[applyString];


                                      if(applyStringKeyArray.length > 1){
                                          return false;
                                      }
                                      applyToken = Object.keys(tokenPlusKey)[0];
                                      applylittleKey = tokenPlusKey[applyToken];


                                      if (typeof applyString == "string") {
                                         if (applyToken == "COUNT" && (applylittleKey == "rooms_fullname" || applylittleKey == "rooms_shortname"
                                            || applylittleKey == "rooms_number" || applylittleKey == "rooms_name" || applylittleKey == "rooms_address"
                                            || applylittleKey == "rooms_lat" || applylittleKey == "rooms_lon" || applylittleKey == "rooms_seats"
                                            || applylittleKey == "rooms_type" || applylittleKey == "rooms_furniture"
                                            || applylittleKey == "courses_year" || applylittleKey == "courses_dept" || applylittleKey == "courses_id"
                                            || applylittleKey == "courses_avg" || applylittleKey == "courses_instructor" || applylittleKey == "courses_title"
                                            || applylittleKey == "courses_pass" || applylittleKey == "courses_fail" || applylittleKey == "courses_audit"
                                            || applylittleKey == "courses_uuid" || applylittleKey == "courses_sectionsize")) {

                                               return true;

                                            } else if ((applyToken == "MAX" || applyToken == "MIN" || applyToken == "SUM" || applyToken == "AVG")
                                              && (applylittleKey == "rooms_lat" || applylittleKey == "rooms_lon" || applylittleKey == "rooms_seats"
                                              || applylittleKey == "courses_year"
                                              || applylittleKey == "courses_avg" || applylittleKey == "courses_title"
                                              || applylittleKey == "courses_pass" || applylittleKey == "courses_fail" || applylittleKey == "courses_audit" || applylittleKey == "courses_sectionsize"
                                            )) {
                                               return true
                                            } else return false;
                                         } else return false
                                     })){

                                        if(columnsApplyArray.every(function (columns:any) {
                                                var tempApplyStrings = apply.map(function (applyKey:any) {
                                                    return Object.keys(applyKey)[0]
                                                })
                                                return tempApplyStrings.includes(columns)
                                            })){

                                            if(columnsGroupArray.every(function (columns:any) {
                                                    return group.includes(columns)
                                                })){
                                                if(optionsValue["FORM"] == "TABLE"){
                                                    return isOneDataset;
                                                }else return false;

                                            }else return false

                                        }else return false
                                    }else return false;


                                }
                            } else return false;
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

    queryCheckingOrder(orderValidKey:any, yesOrNo:any, dataSet:any, invalidIdArray:any, applyExists:boolean):any{
        var isOneDataset:any = {[yesOrNo]:dataSet}
        if (typeof orderValidKey == "string" && (orderValidKey == "courses_dept" || orderValidKey == "courses_id"
            || orderValidKey == "courses_avg" || orderValidKey == "courses_instructor"
            || orderValidKey == "courses_title" || orderValidKey == "courses_pass"
            || orderValidKey == "courses_fail" || orderValidKey == "courses_audit"
            || orderValidKey == "courses_uuid" || orderValidKey == "courses_year" || orderValidKey == "courses_sectionsize")) { //checks for valid key
            if(yesOrNo == "true" && (dataSet[0] == "courses" || dataSet.length == 0)) {
                /**if(transformationExists == true){
                    isOneDataset = {"true":["courses"]}
                }else {
                    Table = optionsValue[columnsEtcKey[2]];
                    if (Table == "TABLE") { //if value of FORM is TABLE
                        isOneDataset = {"true": ["courses"]}
                        return isOneDataset
                    } else return false;
                }*/
                isOneDataset = {"true":["courses"]}
                return isOneDataset;

            } else if(yesOrNo == "true" && (dataSet[0] != "courses")){
                var invalidIdLists:any = orderValidKey.split("_");

                if(invalidIdArray.includes(invalidIdLists[0])){
                    invalidIdLists = [];
                } else {
                    invalidIdArray.push(invalidIdLists[0]);
                }
                isOneDataset = {"false":invalidIdArray}
                /**if(transformationExists == true){
                    isOneDataset = isOneDataset
                }else return isOneDataset;*/
                return isOneDataset;

            } return isOneDataset;
        } else if (typeof orderValidKey == "string" && (orderValidKey == "rooms_fullname" || orderValidKey == "rooms_shortname"
            || orderValidKey == "rooms_number" || orderValidKey == "rooms_name"
            || orderValidKey == "rooms_address" || orderValidKey == "rooms_lat"
            || orderValidKey == "rooms_lon" || orderValidKey == "rooms_seats"
            || orderValidKey == "rooms_type" || orderValidKey == "rooms_href" || orderValidKey == "rooms_furniture" || orderValidKey == "rooms_distance")) { //checks for valid key
            if(yesOrNo == "true" && (dataSet[0] == "rooms" || dataSet.length == 0)) {

                /**
                Table = optionsValue[columnsEtcKey[2]];
                if(transformationExists == true){
                    isOneDataset = {"true":["rooms"]}
                }else {
                    Table = optionsValue[columnsEtcKey[2]];
                    if (Table == "TABLE") { //if value of FORM is TABLE
                        isOneDataset = {"true": ["rooms"]}
                        return isOneDataset
                    } else return false;
                }*/
                isOneDataset = {"true":["rooms"]};
                return isOneDataset;

            } else if(yesOrNo == "true" && (dataSet[0] != "rooms")){
                var invalidIdLists:any = orderValidKey.split("_");

                if(invalidIdArray.includes(invalidIdLists[0])){
                    invalidIdLists = [];
                } else {
                    invalidIdArray.push(invalidIdLists[0]);
                }
                isOneDataset = {"false":invalidIdArray}
                /**if(transformationExists == true){
                    isOneDataset = isOneDataset
                }else return isOneDataset;*/
                return isOneDataset;


            } return isOneDataset;

        } else if (typeof orderValidKey == "string" && (this.occurrences(orderValidKey, "_", true)) == 1 && !(orderValidKey.startsWith("courses")) &&
            (orderValidKey.endsWith("_dept") || orderValidKey.endsWith("_id") || orderValidKey.endsWith("_avg") ||
            orderValidKey.endsWith("_instructor") || orderValidKey.endsWith("_title") || orderValidKey.endsWith("_pass") ||
            orderValidKey.endsWith("_fail") || orderValidKey.endsWith("_audit") || orderValidKey.endsWith("_uuid") || orderValidKey.endsWith("_year") || orderValidKey.endsWith("courses_sectionsize"))) {

            invalidIdLists = orderValidKey.split("_");

            if (invalidIdArray.includes(invalidIdLists[0])) {
                invalidIdLists = [];
            } else {
                invalidIdArray.push(invalidIdLists[0]);
            }
            isOneDataset = {"false":invalidIdArray}
            /**if(transformationExists == true){
                isOneDataset = isOneDataset
            }else return isOneDataset;*/
            return isOneDataset;

        } else if (typeof orderValidKey == "string" && (this.occurrences(orderValidKey, "_", true)) == 1 && !(orderValidKey.startsWith("rooms")) &&
            (orderValidKey.endsWith("_fullname") || orderValidKey.endsWith("_shortname") || orderValidKey.endsWith("_number") ||
            orderValidKey.endsWith("_name") || orderValidKey.endsWith("_address") || orderValidKey.endsWith("_lat") ||
            orderValidKey.endsWith("_lon") || orderValidKey.endsWith("_seats") || orderValidKey.endsWith("_type") || orderValidKey.endsWith("_furniture")
            || orderValidKey.endsWith("_href") || orderValidKey.endsWith("_distance"))) {

            invalidIdLists = orderValidKey.split("_");

            if (invalidIdArray.includes(invalidIdLists[0])) {
                invalidIdLists = [];
            } else {
                invalidIdArray.push(invalidIdLists[0]);
            }
            isOneDataset = {"false":invalidIdArray}
            /**if(transformationExists == true){
                isOneDataset = isOneDataset
            }else return isOneDataset;*/
            return isOneDataset

        } else if (typeof orderValidKey == "string" && (!(orderValidKey.startsWith("courses")) || !(orderValidKey.startsWith("rooms"))) && orderValidKey.includes("_")) {

            invalidIdLists = orderValidKey.split("_");

            if (invalidIdArray.includes(invalidIdLists[0])) {
                invalidIdLists = [];
            } else {
                invalidIdArray.push(invalidIdLists[0]);
            }
            isOneDataset = {"false":invalidIdArray}
            /**if(transformationExists == true){
                isOneDataset = isOneDataset
            }else return isOneDataset;*/
            return isOneDataset;

        } else if(typeof orderValidKey == "string" && !(orderValidKey.includes("_")) && applyExists == true){
            return isOneDataset;
        }else return false
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
                if( validProjectKey.length == 1 && typeof validProjectKey[0] == "string" && (validProjectKey[0] == "courses_avg" || validProjectKey[0] == "courses_pass" ||
                    validProjectKey[0] == "courses_fail" || validProjectKey[0] == "courses_audit" || validProjectKey[0] == "courses_year" || validProjectKey[0] == "courses_sectionsize")){ //make sure only a valid key exists
                    if(yesOrNo == "true" && (dataSet[0] == "courses" || dataSet.length == 0)) {
                        if (isNumber(mComparisonNumber)) { //makes sure the valid keys are mapped to a number
                            isOneDataset = {"true": ["courses"]};
                            return isOneDataset;

                        } else return false;
                    } else if(yesOrNo == "true" && (dataSet[0] != "courses") && typeof validProjectKey[0] == "string"){
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
                else if(validProjectKey.length == 1 && typeof validProjectKey[0] == "string" && (validProjectKey[0] == "rooms_lat" || validProjectKey[0] == "rooms_lon" ||
                    validProjectKey[0] == "rooms_seats" || validProjectKey[0] == "rooms_distance")){ //make sure only a valid key exists

                    if(yesOrNo == "true" && (dataSet[0] == "rooms" || dataSet.length == 0)) {
                        if(validProjectKey[0] == "rooms_distance"){
                            if(mComparisonNumber instanceof Array && typeof mComparisonNumber[0] == "string" && isNumber(mComparisonNumber[1])
                                && isNumber(mComparisonNumber[2]) && isNumber(mComparisonNumber[3])){
                                isOneDataset = {"true":["rooms"]};
                                return isOneDataset;
                            }
                        }else
                        if (isNumber(mComparisonNumber)) { //makes sure the valid keys are mapped to a number
                            isOneDataset = {"true": ["rooms"]};
                            return isOneDataset;

                        } else return false;
                    } else if(yesOrNo == "true" && (dataSet[0] != "rooms") && typeof validProjectKey[0] == "string"){
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
                else if(typeof validProjectKey[0] == "string" && !(validProjectKey[0].startsWith("courses")) && (this.occurrences(validProjectKey[0], "_", true)) == 1 &&
                    (validProjectKey[0].endsWith("_avg") || validProjectKey[0].endsWith("_pass") ||
                    validProjectKey[0].endsWith("_fail") || validProjectKey[0].endsWith("_audit") || validProjectKey[0].endsWith("_year") || validProjectKey[0].endsWith("courses_sectionsize"))){

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
                } else if(typeof validProjectKey[0] == "string" && (!(validProjectKey[0].startsWith("courses")) || !(validProjectKey[0].startsWith("rooms"))) && validProjectKey[0].includes("_")){

                    var invalidIdLists = validProjectKey[0].split("_");

                    if(invalidIdArray.includes(invalidIdLists[0])){
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset;

                    /**} else if(typeof validProjectKey[0] == "string" && ((validProjectKey[0].startsWith("courses")) || (validProjectKey[0].startsWith("rooms"))) && validProjectKey[0].includes("_")){

                    var invalidIdLists = validProjectKey[0].split("_");

                    if(invalidIdArray.includes(invalidIdLists[0])){
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset;*/

                }else return false;


            } else if (comparisonKey[0] == "IS"){ //SComparator

                validProjectKey = Object.keys(comparisonValue);
                sComparisonString = comparisonValue[validProjectKey[0]];
                var yesOrNo = Object.keys(isOneDataset)[0];
                var dataSet = isOneDataset[yesOrNo];
                if(validProjectKey.length == 1  && typeof validProjectKey[0] == "string" && (this.occurrences(validProjectKey[0], "_", true)) == 1 && (validProjectKey[0] == "courses_dept" || validProjectKey[0] == "courses_id"|| validProjectKey[0] == "courses_instructor"||validProjectKey[0] == "courses_title" || validProjectKey[0] == "courses_uuid")){
                    if(yesOrNo == "true" && (dataSet == "courses" || dataSet.length == 0)) {
                        if (isString(sComparisonString) || (sComparisonString.toString().charAt(0) && sComparisonString.toString().charAt(sComparisonString.toString().length - 1) &&
                            isString(sComparisonString))) {
                            isOneDataset = {"true": ["courses"]};
                            return isOneDataset;

                        } else return false;
                    } else if(yesOrNo == "true" && typeof validProjectKey[0] == "string" && (dataSet[0] != "courses")){
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
                    || validProjectKey[0] == "rooms_furniture" || validProjectKey[0] == "rooms_href" || validProjectKey[0] == "rooms_name")){
                    if(yesOrNo == "true" && (dataSet == "rooms" || dataSet.length == 0)) {
                        if (isString(sComparisonString) || (sComparisonString.toString().charAt(0) && sComparisonString.toString().charAt(sComparisonString.toString().length - 1) &&
                            isString(sComparisonString))) {

                            isOneDataset = {"true": ["rooms"]};
                            return isOneDataset;

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

                    } else return isOneDataset
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
                }else if(typeof validProjectKey[0] == "string" && (!(validProjectKey[0].startsWith("courses")) || !(validProjectKey[0].startsWith("rooms"))) && validProjectKey[0].includes("_")) {

                    var invalidIdLists = validProjectKey[0].split("_");

                    if (invalidIdArray.includes(invalidIdLists[0])) {
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false": invalidIdArray}
                    return isOneDataset;
                    /**} else if(typeof validProjectKey[0] == "string" && ((validProjectKey[0].startsWith("courses")) || (validProjectKey[0].startsWith("rooms"))) && validProjectKey[0].includes("_")){

                    var invalidIdLists = validProjectKey[0].split("_");

                    if(invalidIdArray.includes(invalidIdLists[0])){
                        invalidIdLists = [];
                    } else {
                        invalidIdArray.push(invalidIdLists[0]);
                    }
                    isOneDataset = {"false":invalidIdArray}
                    return isOneDataset;*/

                }else {
                    return false;
                }

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
