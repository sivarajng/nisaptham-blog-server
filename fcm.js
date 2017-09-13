var axios = require('axios');

var instance = axios.create({
    baseURL: 'https://fcm.googleapis.com',
    timeout: 3000,
    headers: {
        'Authorization': 'key=<KEY>',
        'Content-Type': 'application/json'
    }
});

class FCMWorker {
    constructor() {
        this.prevPostId = "";
        this.newPostId = "";
        this.newPostObj = {
            id: "",
            title: "",
            summary: ""

        }
        this.monitorNewPost = this.monitorNewPost.bind(this);
        this.checkPostId = this.checkPostId.bind(this);
        this.firstPostId = this.firstPostId.bind(this);
        this.monitorNewPost();
        this.firstRun();
        // this.checkPostId({feed:{entry:[{id:{$t:"00"}}]}});
    }

    firstRun() {
        let _this = this;
        axios.get("https://www.blogger.com/feeds/10674130/posts/default/?alt=json&max-results=1")
            .then(function (response) {
                if (response.data) {
                    _this.firstPostId(response.data);
                }
                else {
                    console.log("firstRun BLOG GET LATEST POST RESPOSNSE HAS NO Data Object");
                }

            })
            .catch(function (error) {
                console.log("firstRun BLOG GET LATEST POST ERROR", error);

            });

    }

    firstPostId(firstData) {
        try {
            if (firstData.feed.entry.length > 0) {
                this.newPostObj.id = firstData.feed.entry[0].id.$t;
                this.newPostObj.title = firstData.feed.entry[0].title.$t;
                this.newPostObj.summary = firstData.feed.entry[0].summary.$t;
                this.prevPostId = this.newPostObj.id;
                this.newPostId = this.newPostObj.id;
                console.log("firstData POST ID SET SUCCESS");
            }

        }
        catch (err) {
            console.log("firstData Exception Error in parsing response.data ", err);
        }

    }
    monitorNewPost() {

        setInterval(() => {

            let _this = this;
            axios.get("https://www.blogger.com/feeds/10674130/posts/default/?alt=json&max-results=1")
                .then(function (response) {
                    if (response.data) {
                        _this.checkPostId(response.data);
                    }
                    else {
                        console.log("BLOG GET LATEST POST RESPOSNSE HAS NO Data Object");
                    }

                })
                .catch(function (error) {
                    console.log("BLOG GET LATEST POST ERROR", error);

                });
       
        }, 900000);


    }

    checkPostId(postData) {

        try {
            if (postData.feed.entry.length > 0) {
                this.newPostObj.id = postData.feed.entry[0].id.$t;
                this.newPostObj.title = postData.feed.entry[0].title.$t;
                this.newPostObj.summary = postData.feed.entry[0].summary.$t;

                this.newPostId = this.newPostObj.id;
            }
            if (this.prevPostId != this.newPostId) {
                this.prevPostId = this.newPostId;
                this.pushNotification(this.newPostObj.title, this.newPostObj.summary.substring(0, 50) + "...");
                console.log("CHECK POST ID : NEW", this.prevPostId);
                console.log("CHECK POST ID : NEW DATE", new Date());
            }
            else {
                console.log("CHECK POST ID : OLD", this.prevPostId);
                console.log("CHECK POST ID : OLD DATE", new Date());
            }
        }
        catch (err) {
            console.log("Exception Error in parsing response.data ", err);
        }

    }

    pushNotification(title, body) {

        let FCMPayload = {
                            "to": "/topics/nisaptham-post",
                            "data": {
                                "type": "MEASURE_CHANGE",
                                "custom_notification": {
                                    "title": title,
                                    "body": body,
                                    "color": "#3391ed",
                                    "priority": "high",
                                    "show_in_foreground": true,
                                    "sound": "default",
                                    "click_action": "fcm.ACTION.HELLO",
                                    "vibrate": 300,
                                    "lights": true,
                                    "uid": "uid",
                                    "icon": "ic_launcher",
                                    "large_icon": "ic_launcher"
                                }
                            },
                            "priority": "high",
                            "click_action": "fcm.ACTION.HELLO",
                            "icon": "ic_launcher",
                            "large_icon": "ic_launcher"
                        }   

        instance.post('/fcm/send', FCMPayload).then((response) => {
            console.log("FCM success response : ", response.data)
        }).catch((err) => {
            console.log("FCM send Error : ", err)
        });

    }
}
let fcmWorker = new FCMWorker();
module.exports  = fcmWorker;
