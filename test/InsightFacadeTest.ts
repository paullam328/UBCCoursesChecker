/**
 * Created by paull on 25/1/2017.
 */


import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse, IInsightFacade} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";

describe("InsightFacadeTest", function () {

    var insight: InsightFacade= null;

    beforeEach(function() {
        insight = new InsightFacade();
    });

    afterEach(function() {
        insight = null;
    });

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    const fs = require('fs');
    it("204: addDataset should add a dataset to UBCInsight", function () {

        return insight.addDataset('testInsight',fs.readFileSync('courses.zip').toString('base64')).then(function (value: InsightResponse) {
            var ir: InsightResponse;
            sanityCheck(value);
            //Log.test(JSON.stringify(value));
            expect(value.code).to.equal(204);
            expect(value.body).to.deep.equal({});
        }).catch(function (err) {
            //Log.test('Error: ' + err);
            expect.fail();//should check the same name within the respairatory
        })

    });
/**
    //testing different addDataset
    it.only("Jon 204: initialize for us", function () {

        return insight.addDataset('courses','courses.zip').then(function (value: InsightResponse) {

            var ir: InsightResponse;
            sanityCheck(value);
            //Log.test(JSON.stringify(value));
            expect(value.code).to.equal(204);
            expect(value.body).to.deep.equal({});
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();//should check the same name within the respairatory
        })

    }); */

    it("204: initialize for us", function () {

        return insight.addDataset('courses',fs.readFileSync('courses.zip').toString('base64')).then(function (value: InsightResponse) {

            var ir: InsightResponse;
            sanityCheck(value);
            //Log.test(JSON.stringify(value));
            expect(value.code).to.equal(204);
            expect(value.body).to.deep.equal({});
        }).catch(function (err) {
            //Log.test('Error: ' + err);
            expect.fail();//should check the same name within the respairatory
        })

    });
    //my thing flipped (204 and 201 flipped)

    it("201: addDataset should add a dataset to UBCInsight", function () {


        fs.writeFile('VirtualInsight', '{}', (err: Error) => {
            if (err) throw err;
        });
        /*fs.writeFile('existingIds_Don\'tMakeAnotherIdOfThisFileName', 'VirtualInsight' + "\r\n", (err: Error) => {
            if (err) throw err;
        });*/
        //insight.addDataset('VirtualInsight',fs.readFileSync('courses.zip').toString('base64'));
        return insight.addDataset('VirtualInsight',fs.readFileSync('courses.zip').toString('base64')).then(function (value: InsightResponse) {
            var ir: InsightResponse;
            sanityCheck(value);
            //Log.test(JSON.stringify(value));
            expect(value.code).to.equal(201);
            expect(value.body).to.deep.equal({});
        }).catch(function (err) {
            //Log.test('Error: ' + err);
            expect.fail();
        })

    });


    it("400: addDataset should detect non-real data files (e.g., Array, invalid JSON, etc.)", function () {
        return insight.addDataset('supposetounparse',fs.readFileSync('unparsable_json.zip').toString('base64')).then(function (value: InsightResponse) {
            expect.fail();
        }).catch(function (value: InsightResponse) {
            var ir: InsightResponse;
            sanityCheck(value);
            //Log.test(JSON.stringify(value));
            expect(value.code).to.equal(400);
            expect(value.body).to.deep.equal({'error': 'cannot set a valid zip that does not contain any real data.'});
        })

    });
    it("400/Bender: addDataset should detect empty zip", function () {
        return insight.addDataset('supposetoempty',fs.readFileSync('empty_zip.zip').toString('base64')).then(function (value: InsightResponse) {
            expect.fail();
        }).catch(function (value: InsightResponse) {
            var ir: InsightResponse;
            sanityCheck(value);
            //Log.test(JSON.stringify(value));
            expect(value.code).to.equal(400);
            expect(value.body).to.deep.equal({'error': 'no datafile is found'});
        })

    });
    it("204: addDataset should add a dataset to UBCInsight and dump the invalid one", function () {
        return insight.addDataset('1json1not',fs.readFileSync('1unparsable1parsable.zip').toString('base64')).then(function (value: InsightResponse) {
            var ir: InsightResponse;
            sanityCheck(value);
            //Log.test(JSON.stringify(value));
            expect(value.code).to.equal(204);
            expect(value.body).to.deep.equal({});
        }).catch(function (err) {
            //Log.test('Error: ' + err);
            expect.fail();//should check the same name within the respairatory
        })

    });


    //TODO: removeDataset

    var JSZip = require('jszip');
    var zip = new JSZip();
    it("204: removeDataset should remove the dataset", function () {
        return insight.removeDataset('testInsight').then(function (value: InsightResponse) {
            var ir: InsightResponse;
            sanityCheck(value);
            Log.test(JSON.stringify(value));
            expect(value.code).to.equal(204);
            expect(value.body).to.deep.equal({});
        }).catch(function (err) {
            Log.test('Error: ' + err);
            expect.fail();//should check the same name within the respairatory
        })

    });

    it("404: removeDataset cannot find the added source", function () {
        return insight.removeDataset('testInsight').then(function (value: InsightResponse) {
            expect.fail();
        }).catch(function (value: InsightResponse) {
            var ir: InsightResponse;
            sanityCheck(value);
            Log.test(JSON.stringify(value));
            expect(value.code).to.equal(404);
            expect(value.body).to.deep.equal({'error': 'delete was a resource that was not previously added'});
        })

    });

  it("BigFish: Should not be able to set a dataset that is not a zip file", function () {
        return insight.addDataset('VirtualInsight',fs.readFileSync('VirtualInsight').toString('base64')).then(function (value: InsightResponse) {
            expect.fail();
        }).catch(function (value: InsightResponse) {
            var ir: InsightResponse;
            sanityCheck(value);
            Log.test(JSON.stringify(value));
            expect(value.code).to.equal(400);
            //expect(value.body).to.deep.equal({'Error': 'Delete was a resource that was not previously added'});
        })
    });



    //ask them about: same name but diff format
    //why's the file produced in spite of having reject statements in front <-- asynchronous
    //courses.zip file will be in diff directory for the user, so it doesn't matter

});

