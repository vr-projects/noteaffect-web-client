var express = require("express");
var cors = require("cors");
var app = express();
// var port = 1337;
var port = 3393;

app.use(
  cors({
    origin: "http://localhost:5000",
  })
);

/**
 * Init app
 * shut down app to simulate not running
 * No need for payload... maybe 404 then not running
 */
app.get("/ping", function (req, res) {
  // NO ERRORS
  res.status(200);
  res.json({ isError: false, errors: [], isViolation: false });

  // HAS ERRORS
  // res.status(451);
  // res.json({
  //   isError: true,
  //   errors: [
  //     {
  //       errorCode: "NO_INTERNET",
  //       errorDesc: "Security Client does not have internet access.",
  //     },
  //     {
  //       errorCode: "NO_FDA",
  //       errorDesc: "Security client has not been granted Full Disk Access",
  //     },
  //   ],
  // });
});

/**
 * Endpoint is in web-server
 * For mock purposes
 * Replaced by internal endpoint `${INTERNAL_APP_BASE_URL}/api/security/${seriesId}/start`
 */
app.get("/startSecurityApp", function (req, res) {
  res.header("Access-Control-Allow-Headers", "Location");
  res.redirect(302, "https://www.google.com");
});

/**
 * Do post to endpoint on slide changes
 */
app.post("/setMonitoring", function (req, res) {
  // SLIDE
  /*
        {
            "isMonitoring": true, // I set to true
            "id": "our sessionId",
            "context": {
                "userId": 1,
                "contextDet" : {
                    "seriesId": 1,
                    "resourceType": "Slide",
                    "lectureId": 1,
                    "slide": 3
                } 
            }
        }
    */

  // USER FILE
  /*
        {
            "isMonitoring": true,
            "id": "our sessionId",
            "context": {
                "userId": 1,
                "contextDet" : {
                    "seriesId": 1,
                    "resourceType": "UserFile",
                    "userFileId": 1
                } 
            }
        }
    */
  res.json({ monitorFlag: true });
});

// will connect to backend server, will send to backend

app.get("/shutdownApp", function (req, res) {
  res.json(true);
});

app.listen(port, function () {
  console.info("Listening on port: " + port);
});
