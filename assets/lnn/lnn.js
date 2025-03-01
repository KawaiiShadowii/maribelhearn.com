/*global $ getCookie deleteCookie setCookie gameAbbr shottypeAbbr generateTableText
generateFullNames generateShottypes fullNameNumber generateShortNames*/
var LNNs, alphaNums = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", language = "en_US", notation = "DMY", selected = "", missingReplays, videoLNNs, testing;

function toggleLayout() {
    if (getCookie("lnn_old_layout")) {
        deleteCookie("lnn_old_layout");
    } else {
        setCookie("lnn_old_layout", true);
    }
}

function restrictions(game) {
    return ({
        "PCB": "n",
        "IN": "fs",
        "UFO": "u",
        "TD": "n",
        "HSiFS": "n",
        "WBaWC": "nn",
        "UM": "n"
    }[game]);
}

function shotRoute(game) {
    return game == "HRtP" || game == "GFW" ? "Route" : "Shottype";
}

function replayPath(game, player, character, type) {
    var folder = player.removeSpaces(), first = player.charAt(0), last = player.charAt(player.length - 1);

    player = player.replace(/[^0-9a-z]/gi, "");

    if (!/[0-9a-z]/gi.test(player)) {
        if (first == last) {
            first = alphaNums.charAt(folder.length - 1);
            last = (type !== "" ? type.charAt(type.length - 1) : alphaNums.charAt(folder.length - 1));
        } else {
            first = alphaNums.charAt(folder.length - 1);
            last = (type !== "" ? type.charAt(type.length - 1) : alphaNums.charAt(folder.length));
        }
    } else {
        first = player.charAt(0);
        last = (type !== "" ? type.charAt(type.length - 1) : player.charAt(player.length - 1));
    }

    return "replays/lnn/" + folder + "/th" + gameAbbr(game) +
    "_ud" + first + last + shottypeAbbr(character) + ".rpy";
}

function hasReplay(game, player, shottype) {
    return videoLNNs[game + shottype + player] || (gameAbbr(game) >= 6 && !missingReplays.contains(game + player.removeSpaces() + shottype));
}

function showLNNs(game) {
    if (typeof game == "object") {
        game = this.id.replace("_image", ""); // if event listener fired
    }

    if (!LNNs) {
        $.get("assets/shared/json/lnnlist.json", function (data) {
            LNNs = data;
            showLNNs(game);
        }, "json");
        return;
    }

    if (game == selected) {
        $("#list").css("display", "none");
        $("#" + game + "_image").css("border", $("#" + game + "_image").hasClass("cover98") ? "1px solid black" : "none");
        $("#fullname, #listhead, #listbody, #listfoot").html("");
        $("#fullname").removeClass(game + "f");
        selected = "";
        return;
    }

    var players = [], typeString = "", gamecount = 0,
        shottype, shotplayers, shotcount, character, type, player, season, i;

    if (selected !== "") {
        $("#" + selected + "_image").css("border", $("#" + selected + "_image").hasClass("cover98") ? "1px solid black" : "none");
    }

    if ($("#fullname").hasClass(selected + "f")) {
        $("#fullname").removeClass(selected + "f");
    }

    $("#" + game + "_image").css("border", "3px solid gold");
    selected = game;
    $("#fullname").addClass(game + "f");
    $("#fullname").html(fullNameNumber(game));
    $("#listhead").html("<tr><th class='general_header " + shotRoute(game).toLowerCase() + "'>" + shotRoute(game) +
    "</th><th class='general_header sorttable_numeric'><span id='numeric' class='nooflnn" + (restrictions(game) ? restrictions(game) : "") +
    "s'>No. of LNNs</span><br><span class='different'>(Different players)</span></th><th class='general_header players'>Players</th></tr>");
    $("#listfoot").html("<tr><td class='foot'><span class='overall'>Overall</span></td>" +
    "<td id='count' class='foot'></td><td id='total' class='foot'></td></tr>");
    $("#listbody").html("");

    for (shottype in LNNs[game]) {
        if (game != "UFO" || (game == "UFO" && !shottype.contains("UFOs"))) {
            shotplayers = [];
            shotcount = 0;
            character = shottype.replace(/UFOs/, "");
            if (game == "IN" || game == "HSiFS") {
                season = shottype.substr(-6);
                $("#listbody").append("<tr><td class='nowrap'><span class='" + shottype.slice(0, -6) + "'>" + shottype.slice(0, -6) +
                "</span><span class='" + season + "'>" + season + "</span></td><td id='" + shottype +
                "n'></td><td id='" + shottype + "'></td>");
            } else {
                $("#listbody").append("<tr><td class='nowrap " + character + "'>" + character +
                "</td><td id='" + character + "n'></td><td id='" + character + "'></td>");
            }
        }

        if (game == "UFO") {
            type = shottype.replace(character, "");
            typeString = (type !== "" ? " (<span class='" + type + "'>" + type + "</span>)" : "");
        }

        for (i in LNNs[game][shottype]) {
            player = LNNs[game][shottype][i];
            shotplayers.push(player + (game == "IN" || game == "UFO" || game == "HSiFS" ? typeString : ""));
            players.pushStrict(player + (testing && hasReplay(game, player, shottype) ? "<span class='dl_icon'></span>" : ""));
            shotcount += 1;
            gamecount += 1;
        }

        if (!(game == "UFO" && type != "UFOs")) {
            shotplayers.sort();
            $("#" + character + "n").html(shotcount);

            if (shotcount === 0) {
                continue;
            }

            for (i in shotplayers) {
                $("#" + character).append(", " + shotplayers[i]);
            }

            if ($("#" + character).html().substring(0, 2) == ", ") {
                $("#" + character).html($("#" + character).html().replace(", ", ""));
            }
        }
    }

    players.sort();

    for (i in players) {
        $("#total").append(", " + players[i]);
    }

    $("#count").html(gamecount + " (" + players.length + ")");
    $("#total").html($("#total").html().replace(", ", ""));
    $("#list").css("display", "block");
    generateTableText("lnn");
    generateFullNames();
    generateShottypes();
}

function showPlayerLNNs(player) {
    if (typeof player == "object") {
        player = this.value; // if event listener fired
    }

    if (!LNNs) {
        $.get("assets/shared/json/lnnlist.json", function (data) {
            LNNs = data;
            showPlayerLNNs(player);
        }, "json");
    }

    if (player === "") {
        return;
    }

    var games = [], sum = 0, max, game, array, replays, gameshots, shottype, character, type, list, replay, tmp;

    $("#playerlistbody").html("");

    for (game in LNNs) {
        if (game == "LM") {
            continue;
        }

        array = [];
        replays = [];
        gameshots = [];
        max = (game == "UFO" ? 6 : Object.keys(LNNs[game]).length);

        for (shottype in LNNs[game]) {
            if (LNNs[game][shottype].contains(player)) {
                if (!games.contains(game)) {
                    $("#playerlistbody").append("<tr><td class='" + game + "l'><span class='" + game + "'>" + game +
                    "</span></td><td id='" + game + "s'></td><td id='" + game + "r'></td></tr>");
                    games.push(game);
                }
                character = shottype.replace(/(FinalA|FinalB|UFOs)/g, "");
                type = shottype.replace(character, "");
                array.push("<span class='" + character + "'>" + character +
                "</span>" + (type === "" ? "": " (<span class='" + type + "'>" + type + "</span>)"));
                if (gameAbbr(game) < 6 || missingReplays.contains(game + player.removeSpaces() + shottype)) {
                    if (videoLNNs.hasOwnProperty(game + shottype + player)) {
                        replays.push("<a href='" + videoLNNs[game + shottype + player] + "' target='_blank'>" + videoLNNs[game + shottype + player] + "</a>");
                    } else {
                        replays.push('-');
                    }
                } else {
                    replay = replayPath(game, player, character, type);
                    tmp = replay.split('/');
                    replays.push("<a href='" + location.origin +
                    "/" + replay + "'>" + tmp[tmp.length - 1] + "</a>");
                }
                gameshots.pushStrict(shottype.replace("UFOs", ""));
                sum += 1;
            }
        }

        list = array.join("<br>");
        $("#" + game + "s").html(list);
        list = replays.join("<br>");
        $("#" + game + "r").html(list);

        if (gameshots.length == max) {
            $("#" + game + "l").append("<br><strong class='all'>(All)</strong>");
        }
    }

    if (sum === 0) {
        $("#playerlist").css("display", "none");
        return;
    }

    $("#playerlistfoot").html("<tr><td colspan='3'></td></tr><tr><td class='total'>Total</td><td colspan='2'>" + sum + "</td></tr>");
    $("#playerlist").css("display", "block");
    generateTableText("lnn");
    generateShortNames();
    generateShottypes();
}

function setLanguage(event) {
    var newLanguage = event.data.language, newNotation = event.data.notation;

    if (language == newLanguage && notation == newNotation) {
        return;
    }

    language = newLanguage;
    setCookie("lang", newLanguage);

    if (newNotation == "DMY" && notation == "MDY") {
        newNotation = "MDY";
    }

    notation = newNotation;
    setCookie("datenotation", newNotation);
    location.href = location.href.split('#')[0].split('?')[0];
}

function parseVideos(videos) {
    videoLNNs = {};
    videos = videos.split(',');

    for (var i = 0; i < videos.length; i++) {
        videos[i] = videos[i].split(';');
        videoLNNs[videos[i][0]] = videos[i][1];
    }

    return videoLNNs;
}

$(document).ready(function () {
    $("#player").on("change", showPlayerLNNs);
    $("#player").on("select", showPlayerLNNs);
    $("#layouttoggle").on("click", toggleLayout);
    $("#contents_new").css("display", "inline-block");
    $("#playersearch").css("display", "block");
    $("#playersearchlink").css("display", "block");
    $("#newlayout").css("display", "block");
    $(".flag").attr("href", "");
    $("#en").on("click", {language: "en_US", notation: "DMY"}, setLanguage);
    $("#jp").on("click", {language: "ja_JP", notation: "YMD"}, setLanguage);
    $("#zh").on("click", {language: "zh_CN", notation: "YMD"}, setLanguage);
    $("#ru").on("click", {language: "ru_RU", notation: "DMY"}, setLanguage);
    $(".game_img").on("click", showLNNs);
    missingReplays = $("#missingReplays").val();
    videoLNNs = parseVideos($("#videos").val());
    testing = Boolean($("#testing").val());

    if (getCookie("lang") == "ja_JP" || location.href.contains("jp")) {
        language = "ja_JP";
        notation = "YMD";
    } else if (getCookie("lang") == "zh_CN" || location.href.contains("zh")) {
        language = "zh_CN";
        notation = "YMD";
    } else if (getCookie("lang") == "ru_RU") {
        language = "ru_RU";
    } else if (getCookie("datenotation") == "MDY" || location.href.contains("en-us")) {
        notation = "MDY";
    } else if (getCookie("datenotation") == "YMD") {
        notation = "YMD";
    }
});
