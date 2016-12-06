$(document).ready(function () {
    var canvas;
    var ctx;
    var radius;

    var canvasmobile;
    var ctxmobile;
    var radiusmobile;

    var linkText = "https://jump.cox.com/tiny/Hrwebclock";
    var linkTextMobile = "https://jump.cox.com/tiny/HRMobileWebclock";
    var linkX = 5;
    var linkY = 15;
    var linkHeight = 10;
    var linkWidth;
    var inLink = false;

    var timeclockDiv = $('#timeclockdiv');
    //var timeclockMobileDiv = $('#timeclockmobilediv');
    var hourlyemployeeDiv = $('#hourlyemployee');
    var nonhourlyemployeeDiv = $('#nonhourlyemployee');

    getUserProfileProperty("FLSAStatus").then(
            function (jsonObject) {
                var flsastatus = jsonObject.substring(1, jsonObject.length - 1);
                getUserProfileProperty("TimeReportingStatus").then(
                    function (jsonObject) {
                        var timereportingstatus = jsonObject.substring(1, jsonObject.length - 1);
                        if (flsastatus === "Non-Exempt" && timereportingstatus === "Active") {
                            timeclockDiv.html('<a href=' + linkText + '><canvas id="canvas" width="150" height="150" style="background-color:#F5822F"></canvas></a>');
                            //timeclockMobileDiv.html('<a href=' + linkTextMobile + '><canvas id="canvasmobile" width="150" height="150" style="background-color:#F5822F"></canvas></a>');
                            canvas = document.getElementById("canvas");
                            ctx = canvas.getContext("2d");
                            radius = canvas.height / 2;
                            ctx.translate(radius, radius);
                            radius = radius * 0.80;

                            //canvasmobile = document.getElementById("canvasmobile");
                            //ctxmobile = canvasmobile.getContext("2d");
                            //radiusmobile = canvasmobile.height / 2;
                            //ctxmobile.translate(radiusmobile, radiusmobile);
                            //radiusmobile = radiusmobile * 0.80;

                            setInterval(drawClock, 1000);
                        }
                        else
                        {
                            hourlyemployeeDiv.hide();
                        }
                    },
                    function (error) {
                        //alert(error.get_message());
                    }
                );
            },
            function (error) {
                //alert(error.get_message());
            }
    );

    function drawClock() {
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#F5822F";
        ctx.fill();

        //ctxmobile.arc(0, 0, radiusmobile, 0, 2 * Math.PI);
        //ctxmobile.fillStyle = "#F5822F";
        //ctxmobile.fill();

        drawFace(ctx, radius);
        drawNumbers(ctx, radius);
        drawTime(ctx, radius);

        //drawFace(ctxmobile, radiusmobile);
        //drawNumbers(ctxmobile, radiusmobile);
        //drawTime(ctxmobile, radiusmobile);
    }
    function drawFace(ctx, radius) {
        var grad;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#F5822F';
        ctx.fill();

        grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.5, 'white');
        grad.addColorStop(1, '#fff');
        ctx.strokeStyle = grad;
        ctx.lineWidth = radius * 0.1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
    function drawNumbers(ctx, radius) {
        var ang;
        var num;
        ctx.font = radius * 0.25 + "px arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        for (num = 1; num < 13; num++) {
            ang = num * Math.PI / 6;
            ctx.rotate(ang);
            ctx.translate(0, -radius * 0.80);
            ctx.rotate(-ang);
            ctx.fillText(num.toString(), 0, 0);
            ctx.rotate(ang);
            ctx.translate(0, radius * 0.80);
            ctx.rotate(-ang);
        }
    }
    function drawTime(ctx, radius) {
        var now = new Date();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        //hour
        hour = hour % 12;
        hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
        drawHand(ctx, hour, radius * 0.5, radius * 0.07);
        //minute
        minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
        drawHand(ctx, minute, radius * 0.7, radius * 0.07);
        // second
        second = (second * Math.PI / 30);
        drawHand(ctx, second, radius * 0.8, radius * 0.02);
    }

    function drawHand(ctx, pos, length, width) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.moveTo(0, 0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.rotate(-pos);
    }

    function getUserProfileProperty(profileProperty) {
        var userProfileDef = $.Deferred();
        var JSON = getUserProfilePropertyValue(profileProperty);
        userProfileDef.resolve(JSON);
        return userProfileDef.promise();
    }

});