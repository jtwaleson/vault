var cryptico = window.cryptico;
var RSAKey = window.RSAKey;
var parseBigInt = window.parseBigInt;

RSAKey.prototype.toJSON = function () {
    return JSON.stringify({
        coeff: this.coeff.toString(16),
        d: this.d.toString(16),
        dmp1: this.dmp1.toString(16),
        dmq1: this.dmq1.toString(16),
        e: this.e,
        n: this.n.toString(16),
        p: this.p.toString(16),
        q: this.q.toString(16),
    });
};
RSAKey.prototype.fromJSON = function (json) {
    var obj = JSON.parse(json);
    this.coeff = parseBigInt(obj.coeff, 16);
    this.d = parseBigInt(obj.d, 16);
    this.dmp1 = parseBigInt(obj.dmp1, 16);
    this.dmq1 = parseBigInt(obj.dmq1, 16);
    this.e = obj.e;
    this.n = parseBigInt(obj.n, 16);
    this.p = parseBigInt(obj.p, 16);
    this.q = parseBigInt(obj.q, 16);
    return this;
};
function get_url_parameter(name) {
    var result = decodeURI(
        (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [,null])[1]
    );
    return result === 'null' ? null : result;
}
function generate_new_key(callback) {
    var finished = false;
    var entropy = '';
    $("body").empty()
        .append($("<h1>").text("Generating a new key pair. Shake your phone or move the mouse for entropy!"))
        .append($("<h2>").append("<span id='counter'>").append("%"))
        .append($("<h2>").append("<span id='motion'>"));
    var counter = $("#counter").text("0.0");
    function add_entropy(num) {
        if (finished) { return; }
        entropy += num.toString(16);
        var percentage = 100 * Math.min(1, entropy.length / 512);
        counter.text(percentage.toFixed(2));
        if (percentage === 100) {
            finished = true;
            $(window).off("mousemove");
            $(window).off("deviceorientation");
            $(window).off("MozOrientation");
            $("body").empty()
                .append($("<h1>").text("Enough entropy collected, now generating key pair. This can take some seconds, up to a minute on iPhone4."));
            try {
                var keypair = cryptico.generateRSAKey(entropy, 512);
                callback(keypair);
            } catch (e) {
                $("body").append($("<p>").text(e));
                $("body").append($("<p>").text(e.stack));
            }
        }
    }
    $(window).on("mousemove", function (event) {
        add_entropy(event.clientX % 16);
        add_entropy(event.clientY % 16);
    });
    (function () {
        var last = {x: 0, y: 0, z: 0};
        function deviceOrientationHandler(values) {
            for (var k in last) {
                var diff = Math.floor(Math.abs(values[k] - last[k]));
                while (diff >= 16) {
                    add_entropy(diff % 16);
                    add_entropy(Math.floor(Math.random() * 16));
                    add_entropy(Math.floor(Math.random() * 16));
                    diff = diff >> 4;
                    last[k] = values[k];
                }
            }
        }
        if (window.DeviceOrientationEvent) {
            $(window).on('deviceorientation', function (event) {
                var tiltLR = event.originalEvent.gamma;
                var tiltFB = event.originalEvent.beta;
                var dir = event.originalEvent.alpha;
                deviceOrientationHandler({x: tiltLR, y: tiltFB, z: dir});
            });
        } else if (window.OrientationEvent) {
            $(window).on('MozOrientation', function (event) {
                var tiltLR = event.originalEvent.x * 90;
                var tiltFB = event.originalEvent.y * -90;
                var motUD = event.originalEvent.z;
                deviceOrientationHandler({x: tiltLR, y: tiltFB, z: motUD});
            });
        }
    })();
}
function respond_to_challenge(keypair, challenge, callback) {
    $("body").empty()
        .append($("<h1>").text("Responding to challenge using the stored key pair."));
    $.post(callback, {
        challenge: challenge,
        signature: keypair.signStringWithSHA256(challenge),
        public_key: cryptico.publicKeyString(keypair),
    }, function () {
        alert("Success, you can close this window now.");
    });
}
$(function () {
    if (window.localStorage) {
        var challenge = get_url_parameter('challenge');
        var callback = get_url_parameter('callback');
        if (challenge && callback) {
            if (localStorage.getItem('keypair')) {
                var keypair = new RSAKey();
                keypair.fromJSON(localStorage.getItem('keypair'));
                respond_to_challenge(keypair, challenge, callback);
            } else {
                generate_new_key(function (new_keypair) {
                    localStorage.removeItem('keypair');
                    localStorage.setItem('keypair', new_keypair.toJSON());
                    $("body").empty()
                        .append($("<h1>").text("Key generated and stored!"));
                    respond_to_challenge(new_keypair, challenge, callback);
                });
            }
        } else {
            $("body").empty()
                .append($("<h1>").text("You need to land on this page with 'challenge' and 'callback' query parameters."));
        }
    } else {
        $("body").empty()
            .append($("<h1>").text("Your browser does not support localStorage. Too bad!"));
    }
});
