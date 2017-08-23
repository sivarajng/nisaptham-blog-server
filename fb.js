var firebase = require('firebase');
const axios = require('axios');
const Translate = require('@google-cloud/translate');
var language = require('@google-cloud/language');
const api = "";
var googleTranslate = require('google-translate')(api);







var DOMParser = require('react-native-html-parser').DOMParser;
var XMLSerializer = require('react-native-html-parser').XMLSerializer;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;



var config = {
    databaseURL: "https://firebaseio.com",
};

firebase.initializeApp(config);


check = (request, responseBASE) => {

    console.log("sssssssssssssss INSIDE");

    postId = request.query.postId || "859210520130512721";
    console.log("sssssssssssssss INSIDE", postId);
    postIdTA = postId + "-ta";
    postIdEN = postId + "-en";
    postIdNT = postId + "-nt";


    //  getPostText(request, response, request.query.postId);


    firebase.database().ref().child('posts').child(postIdNT).once('value').then(function (snap) {

        //  console.log("sssssssssssssss INSIDE SNAPPP",snap.val());
        if (snap.val() == null) {
            /********************* */
            axios.get('https://www.blogger.com/feeds/10674130/posts/default/' + postId + '?alt=json')
                .then(function (response) {

                    //////////////////////////////////
                    axios.get(response.data.entry.link[4].href)
                        .then(function (response) {
                            let doc = new DOMParser().parseFromString(response.data, 'text/html');
                            doc = new XMLSerializer().serializeToString(doc.getElementByClassName('post-body entry-content'));

                            let dom = new JSDOM(doc);
                            let finaltext = dom.window.document.querySelector("div").textContent;
                            console.log("+++++++++++++++++++++++");
                            // res.header("Content-Type", "application/json; charset=utf-8");
                            // res.end(finaltext);




                            console.log("VAL IS NULL");
                            firebase.database().ref().child('posts').child(postIdTA).set(finaltext, function (error) {
                                if (error) {
                                    console.log("Data could not be saved. TAMIL" + error);
                                    responseBASE.end("FAILED SAVE TAMIL");
                                } else {
                                    console.log("Data saved successfully. TAMIL");

                                    googleTranslate.translate(finaltext, 'ta', 'en', function (err, translation) {
                                     //   console.log("translation ", translation.translatedText);

                                        firebase.database().ref().child('posts').child(postIdEN).set(translation.translatedText, function (error) {
                                            if (error) {
                                                console.log("Data could not be saved. TRANST ENGLISH" + error);
                                                responseBASE.end("FAILED SAVE TRANST ENGLISH");
                                            } else {
                                                console.log("Data saved successfully. TRANST ENGLISH ");



                                                axios.post("https://language.googleapis.com/v1/documents:annotateText?fields=documentSentiment%2Centities(name%2Ctype)&key=" + api,
                                                    {
                                                        "document":
                                                        {
                                                            "content": translation.translatedText,
                                                            "language": "en",
                                                            "type": "PLAIN_TEXT"
                                                        },
                                                        "encodingType": "UTF8",
                                                        "features":
                                                        {
                                                            "extractDocumentSentiment": true,
                                                            "extractEntities": true
                                                        }
                                                    }

                                                ).then(function (response) {
                                                //    console.log(response.data);

                                                    finalCOGNITIEDATA = JSON.stringify(response.data);
                                                    firebase.database().ref().child('posts').child(postIdNT).set(finalCOGNITIEDATA, function (error) {
                                                        if (error) {
                                                            console.log("Data could not be saved. NATURAL LANG" + error);
                                                            responseBASE.end("FAILED SAVE NATURAL LANG");
                                                        } else {
                                                            console.log("Data saved successfully. NATURAL LANG ");
                                                             responseBASE.end(finalCOGNITIEDATA);
                                                        }
                                                    });


                                                }).catch(function (error) {
                                                    console.log(error);
                                                    responseBASE.end("FAILED NATURAL LANGUAGE API");
                                                });


                                                // responseBASE.end("SAVED SUCCESS EN " + translation.translatedText);
                                                //   responseBASE.end(finaltext);
                                            }
                                        });
                                        // =>  Mi nombre es Brandon
                                    });



                                }
                            });



                        })
                        .catch(function (error) {
                            console.log(error);

                        });

                    //////////////////////////////////
                })
                .catch(function (error) {
                    console.log(error);

                });
            /********************* */












        }
        else {
            console.log("EXISTS "+postIdNT);
            responseBASE.end(snap.val());
            //   console.log(snap.val());
        }

        //  firebase.database().goOffline();
        //   firebase.database().goOnline();
    }).catch((err) => { });



}


var getPostText = (req, res, postId = "859210520130512721") => {

    axios.get('https://www.blogger.com/feeds/10674130/posts/default/' + postId + '?alt=json')
        .then(function (response) {

            //////////////////////////////////
            axios.get(response.data.entry.link[4].href)
                .then(function (response) {
                    let doc = new DOMParser().parseFromString(response.data, 'text/html');
                    doc = new XMLSerializer().serializeToString(doc.getElementByClassName('post-body entry-content'));

                    let dom = new JSDOM(doc);
                    let finaltext = dom.window.document.querySelector("div").textContent;
                    //   console.log("+++++++++++++++++++++++", finaltext);
                    res.header("Content-Type", "application/json; charset=utf-8");
                    res.end(finaltext);

                })
                .catch(function (error) {
                    console.log(error);
                    res.end(error);
                });

            //////////////////////////////////
        })
        .catch(function (error) {
            console.log(error);
            res.end(error);
        });

}


module.exports.check = check;



