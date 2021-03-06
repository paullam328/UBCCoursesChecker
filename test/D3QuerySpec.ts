/**
 * Created by johnz on 2017-03-08.
 */
import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse, QueryRequest, IInsightFacade, FilterQuery, MCompare} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";


describe("D3QueryTestSpec", function () {

    var insightFacade: InsightFacade = null;
    var insight: InsightFacade = null;
    var testInvalidKeys: string[] = [];
    var fs = require("fs")


    function sanityCheck(response: QueryRequest) {
        expect(response).to.have.property('WHERE');
        expect(response).to.have.property('OPTIONS');

        //expect(response.WHERE).to.be.a("FilterQuery");
    }

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
        insightFacade = new InsightFacade();
        insight = new InsightFacade();
        return insight.addDataset('rooms', fs.readFileSync('rooms.zip').toString('base64'))
        //return insight.addDataset('courses', fs.readFileSync('courses.zip').toString('base64'))


    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
        //insightFacade = new InsightFacade();
        //return insight.addDataset('courses',fs.readFileSync('courses.zip').toString('base64'))
        // return insightFacade.removeDataset('courses');

    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
        insightFacade = null
        return insight.removeDataset('rooms');
        //return insight.removeDataset('courses');

    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
        //return insight.removeDataset('courses');


    });

    it("checking out NO FILTER complex query provided in deliverable", function () {
        var queryTest: any = {
            "WHERE": {
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        }
        //sanityCheck(queryTest);
        var result = {"true": ["courses"]};
        expect(insightFacade.isValid(queryTest)).to.deep.equal(result);
    });

    it("checking out weird query provided in deliverable", function () {
        var queryTest: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        }
        sanityCheck(queryTest);
        var result = {"true": ["rooms"]};
        expect(insightFacade.isValid(queryTest)).to.deep.equal(result);
    });

    it("checking out complex query provided in deliverable", function () {
        var queryTest: any = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        }
        sanityCheck(queryTest);
        var result = {"true": ["rooms"]};
        expect(insightFacade.isValid(queryTest)).to.deep.equal(result);
    });

    it("checking out complex query provided in deliverable", function () {
        var queryTest: any = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        }
        sanityCheck(queryTest);
        var result = {"true": ["rooms"]};
        expect(insightFacade.isValid(queryTest)).to.deep.equal(result);
    });

    it( "200 transform", function () {
            var queryTest:any =    {
                "WHERE": {
                    "AND": [{
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    }, {
                        "GT": {
                            "rooms_seats": 300
                        }
                    }]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_shortname",
                        "anything"
                    ],
                    "ORDER": {
                        "dir": "DOWN",
                        "keys": ["anything"]
                    },
                    "FORM": "TABLE"
                },
                "TRANSFORMATIONS": {
                    "GROUP": ["rooms_shortname"],
                    "APPLY": [{
                        "anything": {
                            "MAX": "rooms_seats"
                        }
                    }]
                }
            }
        sanityCheck(queryTest);

        var result = {"render":"TABLE","result":[{"rooms_shortname":"OSBO","anything":442},{"rooms_shortname":"HEBB","anything":375},{"rooms_shortname":"LSC","anything":350}]}

        return insightFacade.performQuery(queryTest).then(function (value: InsightResponse){
            expect(value.code).to.equal(200);
            expect(value.body).to.deep.equal(result)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error":"malformed transformation"})
        })



    });

    it( "200 multiple transform", function () {
        var queryTest:any =    {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 100
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "anything",
                    "something",
                    "many things"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["anything"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "anything": {
                        "MAX": "rooms_seats"
                    }
                },
                    {
                        "something": {
                            "COUNT": "rooms_seats"
                        }
                    },
                    {
                        "many things": {
                            "SUM": "rooms_seats"
                        }
                    }
                ]
            }
        }
        sanityCheck(queryTest);

        var result =
            {"render":"TABLE","result":[{"rooms_shortname":"OSBO","anything":442,"something":1,"many things":442},{"rooms_shortname":"HEBB","anything":375,"something":1,"many things":375},{"rooms_shortname":"LSC","anything":350,"something":2,"many things":825},{"rooms_shortname":"SRC","anything":299,"something":1,"many things":897},{"rooms_shortname":"ANGU","anything":260,"something":1,"many things":260},{"rooms_shortname":"PHRM","anything":236,"something":2,"many things":403},{"rooms_shortname":"LSK","anything":205,"something":2,"many things":388},{"rooms_shortname":"CHBE","anything":200,"something":1,"many things":200},{"rooms_shortname":"SWNG","anything":190,"something":3,"many things":755},{"rooms_shortname":"DMP","anything":160,"something":2,"many things":280},{"rooms_shortname":"FRDM","anything":160,"something":1,"many things":160},{"rooms_shortname":"IBLC","anything":154,"something":2,"many things":266},{"rooms_shortname":"MCLD","anything":136,"something":2,"many things":259},{"rooms_shortname":"WOOD","anything":120,"something":1,"many things":360},{"rooms_shortname":"BUCH","anything":108,"something":1,"many things":216}]}

        return insightFacade.performQuery(queryTest).then(function (value: any){
            expect(value.code).to.equal(200);
            Log.info("actual: "+JSON.stringify(value.body))
            Log.info("expected: "+JSON.stringify(result))
            var resultKey:any = value.body["result"];
            var expectedResult:any = result["result"];
            for(let x in resultKey){
                expect(expectedResult).to.include(resultKey[x])
            }
            for(let x in expectedResult){
                expect(resultKey).to.include(expectedResult[x])
            }
            //expect(expectedResult).includes(resultKey);
            expect(expectedResult.length).to.deep.equal(resultKey.length);
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error":"malformed transformation"})
        })



    });

    it( "200 dataset in apply", function () {
        var queryTest:any =    {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 100
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats", "rooms_shortname"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        }

        var result =
            {"render":"TABLE","result":[{"rooms_shortname":"OSBO","maxSeats":442},{"rooms_shortname":"HEBB","maxSeats":375},{"rooms_shortname":"LSC","maxSeats":350},{"rooms_shortname":"SRC","maxSeats":299},{"rooms_shortname":"ANGU","maxSeats":260},{"rooms_shortname":"PHRM","maxSeats":236},{"rooms_shortname":"LSK","maxSeats":205},{"rooms_shortname":"CHBE","maxSeats":200},{"rooms_shortname":"SWNG","maxSeats":190},{"rooms_shortname":"FRDM","maxSeats":160},{"rooms_shortname":"DMP","maxSeats":160},{"rooms_shortname":"IBLC","maxSeats":154},{"rooms_shortname":"MCLD","maxSeats":136},{"rooms_shortname":"WOOD","maxSeats":120},{"rooms_shortname":"BUCH","maxSeats":108}]}

        return insightFacade.performQuery(queryTest).then(function (value: InsightResponse){
            expect(value.code).to.equal(200);
            expect(value.body).to.deep.equal(result)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(424);
            expect(err.body).to.deep.equal({"missing":["test","other"]})
        })



    });

    it( "200 simple query deliverable", function () {
        var queryTest:any =   {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        }
        sanityCheck(queryTest);

        var result =
            {
                "render": "TABLE",
                "result": [{
                    "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs"
                }, {
                    "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs"
                }, {
                    "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs"
                }, {
                    "rooms_furniture": "Classroom-Fixed Tablets"
                }, {
                    "rooms_furniture": "Classroom-Hybrid Furniture"
                }, {
                    "rooms_furniture": "Classroom-Learn Lab"
                }, {
                    "rooms_furniture": "Classroom-Movable Tables & Chairs"
                }, {
                    "rooms_furniture": "Classroom-Movable Tablets"
                }, {
                    "rooms_furniture": "Classroom-Moveable Tables & Chairs"
                }, {
                    "rooms_furniture": "Classroom-Moveable Tablets"
                }]
            }
        return insightFacade.performQuery(queryTest).then(function (value: InsightResponse){
            expect(value.code).to.equal(200);
            expect(value.body).to.deep.equal(result)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error":"malformed transformation"})
        })

    });

    it( "200 simple query no ORDER with TRANSFORMATION", function () {
        var queryTest:any =   {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        }
        sanityCheck(queryTest);

        var result =
            {"render":"TABLE","result":[{"rooms_furniture":"Classroom-Movable Tables & Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs"},{"rooms_furniture":"Classroom-Movable Tablets"},{"rooms_furniture":"Classroom-Fixed Tablets"},{"rooms_furniture":"Classroom-Moveable Tables & Chairs"},{"rooms_furniture":"Classroom-Learn Lab"},{"rooms_furniture":"Classroom-Hybrid Furniture"},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs"},{"rooms_furniture":"Classroom-Moveable Tablets"}]}

        return insightFacade.performQuery(queryTest).then(function (value: any){
            expect(value.code).to.equal(200);
            var resultKey:any = value.body["result"];
            var expectedResult:any = result["result"];
            for(let x in resultKey){
                expect(expectedResult).to.include(resultKey[x])
            }
            for(let x in expectedResult){
                expect(resultKey).to.include(expectedResult[x])
            }
            //expect(expectedResult).includes(resultKey);
            expect(expectedResult.length).to.deep.equal(resultKey.length);
            //expect(value.body).to.deep.equal(result);
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"error":"malformed transformation"})
        })

    });

    it("200 testing out new ORDER with no TRANSFORMATION", function () {

        var queryTest: any =  {
            "WHERE": {
                "AND": [{
                    "OR":[{
                        "IS":{
                            "rooms_type":"Tiered Large Group"
                        }
                    }]},
                    {
                        "GT": {
                            "rooms_lat": 49.2612
                        }
                    },
                    {
                        "LT": {
                            "rooms_lat": 49.26129
                        }
                    },
                    {
                        "LT": {
                            "rooms_lon": -123.2480
                        }
                    },
                    {
                        "GT": {
                            "rooms_lon": -123.24809
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "rooms_shortname",
                    "rooms_number",
                    "rooms_name",
                    "rooms_address",
                    "rooms_type",
                    "rooms_furniture",
                    "rooms_href",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["rooms_number", "rooms_href"]
                },
                "FORM": "TABLE"
            }
        }

        var result =
            {"render":"TABLE","result":[{"rooms_fullname":"Hugh Dempster Pavilion","rooms_shortname":"DMP","rooms_number":"310","rooms_name":"DMP_310","rooms_address":"6245 Agronomy Road V6T 1Z4","rooms_type":"Tiered Large Group","rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_href":"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-310","rooms_lat":49.26125,"rooms_lon":-123.24807,"rooms_seats":160},{"rooms_fullname":"Hugh Dempster Pavilion","rooms_shortname":"DMP","rooms_number":"301","rooms_name":"DMP_301","rooms_address":"6245 Agronomy Road V6T 1Z4","rooms_type":"Tiered Large Group","rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_href":"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-301","rooms_lat":49.26125,"rooms_lon":-123.24807,"rooms_seats":80},{"rooms_fullname":"Hugh Dempster Pavilion","rooms_shortname":"DMP","rooms_number":"110","rooms_name":"DMP_110","rooms_address":"6245 Agronomy Road V6T 1Z4","rooms_type":"Tiered Large Group","rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_href":"http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-110","rooms_lat":49.26125,"rooms_lon":-123.24807,"rooms_seats":120}]}
        return insightFacade.performQuery(queryTest).then(function (value: any) {
            expect(value.code).to.equal(200);
            var resultKey:any = value.body["result"]
            var expectedResult:any = result["result"];
            expect(value.body).to.deep.equal(result);
            for(let x in resultKey){
                expect(expectedResult).to.include(resultKey[x])
            }
            for(let x in expectedResult){
                expect(resultKey).to.include(expectedResult[x])
            }
            //expect(expectedResult).includes(resultKey);
            expect(expectedResult.length).to.deep.equal(resultKey.length);
        }).catch(function (err) {
            Log.test('Error: ' + err);

            expect(err.code).to.equal(400);
            expect(err.body).to.deep.equal({"missing": ["rooms"]})

        })




    });

    it( "200 old ORDER with TRANSFORMATION", function () {
        var queryTest:any =    {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        }

        var result =
            {"render":"TABLE","result":[{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs"},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs"},{"rooms_furniture":"Classroom-Fixed Tablets"},{"rooms_furniture":"Classroom-Hybrid Furniture"},{"rooms_furniture":"Classroom-Learn Lab"},{"rooms_furniture":"Classroom-Movable Tables & Chairs"},{"rooms_furniture":"Classroom-Movable Tablets"},{"rooms_furniture":"Classroom-Moveable Tables & Chairs"},{"rooms_furniture":"Classroom-Moveable Tablets"}]}

        return insightFacade.performQuery(queryTest).then(function (value: InsightResponse){
            expect(value.code).to.equal(200);
            expect(value.body).to.deep.equal(result)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(424);
            expect(err.body).to.deep.equal({"missing":["test","other"]})
        })

    });


    it.only( "200 new ORDER with TRANSFORMATION ROOM courses", function () {
        var queryTest:any =     {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture",
                    "rooms_shortname",
                    "stuffytest"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["rooms_furniture", "rooms_shortname"]
                },
                "FORM": "TABLE"
            }, "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture", "rooms_shortname", "rooms_seats", "rooms_href"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                },{
                    "stuffytest": {
                        "COUNT": "rooms_seats"
                    }
                }]
            }
        }

        var result =
            {"render":"TABLE","result":[{"rooms_furniture":"Classroom-Moveable Tablets","rooms_shortname":"ANSO","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"GEOG","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"GEOG","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"ANSO","stuffytest":1},{"rooms_furniture":"Classroom-Moveable Tables & Chairs","rooms_shortname":"ANSO","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"SOWK","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"SOWK","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"SOWK","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"SOWK","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"PCOH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"OSBO","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"MGYM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"MGYM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"MATH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"MATH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"MATH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"MATH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"LASR","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"FNH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"FNH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"FNH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"FNH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"UCLL","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"UCLL","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SRC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SRC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SRC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SPPH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SPPH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SPPH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SOWK","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SOWK","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SOWK","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PCOH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PCOH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PCOH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PCOH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PCOH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"PCOH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"OSBO","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"OSBO","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MCLD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MCLD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MCLD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MCLD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MATH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MATH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"MATH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"LSK","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"LSK","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"LASR","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"LASR","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IONA","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"HENN","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"HENN","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"HENN","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"HEBB","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"HEBB","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"HEBB","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"GEOG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"GEOG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"GEOG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"GEOG","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"FORW","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"FORW","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"FNH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"EOSM","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"DMP","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"DMP","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"CHBE","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"CEME","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"CEME","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BRKX","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BIOL","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"BIOL","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"AUDX","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"AUDX","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANSO","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ALRD","stuffytest":1},{"rooms_furniture":"Classroom-Movable Tables & Chairs","rooms_shortname":"ALRD","stuffytest":1},{"rooms_furniture":"Classroom-Learn Lab","rooms_shortname":"UCLL","stuffytest":1},{"rooms_furniture":"Classroom-Learn Lab","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Learn Lab","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Hybrid Furniture","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Hybrid Furniture","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Hybrid Furniture","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Hybrid Furniture","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Hybrid Furniture","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Hybrid Furniture","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Hybrid Furniture","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Hybrid Furniture","rooms_shortname":"ESB","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"WESB","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"WESB","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"SCRF","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"MATX","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"MATH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"LASR","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"LASR","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"HENN","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"HENN","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"HENN","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"GEOG","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"FNH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"ESB","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"CIRS","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"CHEM","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"CHEM","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"CHEM","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"CHEM","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"CHEM","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"CHEM","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"BIOL","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tablets","rooms_shortname":"AERL","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Moveable Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"WOOD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"UCLL","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"SWNG","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"SPPH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"SPPH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"SPPH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"PHRM","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"PCOH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ORCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"MCML","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"LSC","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"LSC","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"LSC","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"IONA","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"GEOG","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"FSC","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"FRDM","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"FORW","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ESB","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"DMP","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"DMP","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"DMP","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"CHBE","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"CHBE","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"CEME","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"CEME","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"CEME","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"BRKX","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"BIOL","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ANGU","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ALRD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ALRD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Movable Chairs","rooms_shortname":"ALRD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"MCLD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"MCLD","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"LSK","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"LSK","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"LASR","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"IBLC","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"HEBB","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"CEME","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"BUCH","stuffytest":1},{"rooms_furniture":"Classroom-Fixed Tables/Fixed Chairs","rooms_shortname":"BUCH","stuffytest":1}]}

        return insightFacade.performQuery(queryTest).then(function (value: InsightResponse){
            expect(value.code).to.equal(200);
            expect(value.body).to.deep.equal(result)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(424);
            expect(err.body).to.deep.equal({"missing":["test","other"]})
        })

    });

    it.skip("200 Titanium for COURSES", function () {
        var queryTest: any = {
            "WHERE": {
                "OR": [/**{
                    "IS": {
                        "courses_uuid": "31379"
                    }
                },*/{
                    "IS": {
                        "courses_uuid": "10235"
                    }
                },
                    {
                        "IS": {
                            "courses_uuid": "10236"
                        }
                    },
                    {
                        "IS": {
                            "courses_uuid": "10237"
                        }
                    },
                    {
                        "IS": {
                            "courses_uuid": "10238"
                        }
                    },
                    {
                        "IS": {
                            "courses_uuid": "10239"
                        }
                    },
                    {
                        "IS": {
                            "courses_uuid": "10240"
                        }
                    },
                    {
                        "IS": {
                            "courses_uuid": "10235"
                        }
                    },{
                        "IS": {
                            "courses_uuid": "10235"
                        }
                    },{
                        "IS": {
                            "courses_uuid": "10235"
                        }
                    },{
                        "IS": {
                            "courses_uuid": "10250"
                        }
                    },{
                        "IS": {
                            "courses_uuid": "20135"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "maxGrade",
                    "courses_uuid"
                ],
                    "ORDER": "courses_uuid",
                    "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP":["courses_uuid", "courses_dept"],
                    "APPLY": [
                    {
                        "minGrade": {
                            "MIN": "courses_avg"
                        }
                    },
                    {
                        "maxGrade": {
                            "MAX": "courses_avg"
                        }
                    }
                ]
            }
        }

        var result = {"render":"TABLE","result":[{"courses_uuid":"10235","courses_dept":"eece","maxGrade":98.75},{"courses_uuid":"10236","courses_dept":"eece","maxGrade":98.75},{"courses_uuid":"10237","courses_dept":"eece","maxGrade":87.53},{"courses_uuid":"10238","courses_dept":"eece","maxGrade":87.53},{"courses_uuid":"10239","courses_dept":"eece","maxGrade":90.27},{"courses_uuid":"10240","courses_dept":"eece","maxGrade":90.27},{"courses_uuid":"10250","courses_dept":"eece","maxGrade":79.79}/**,{"courses_uuid":"31379","courses_dept":"aanb","maxGrade":94.44}*/]}


        //sanityCheck(queryTest);
        return insightFacade.performQuery(queryTest).then(function (value: InsightResponse){
            expect(value.code).to.equal(200);
            expect(value.body).to.deep.equal(result)
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect(err.code).to.equal(424);
            expect(err.body).to.deep.equal({"missing":["test","other"]})
        })
    });


});