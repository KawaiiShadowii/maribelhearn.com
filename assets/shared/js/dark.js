var language, done, head, hy;

function dark() {
    var style = document.createElement("link"), page = location.pathname.split('/')[1];
    style.id = "dark_theme";
    style.href = (location.host != "localhost" || location.pathname.indexOf("error") > -1 ? "https://maribelhearn.com/" : "/") + "assets/shared/dark.css";
    style.type = "text/css";
    style.rel = "stylesheet";
    head.appendChild(style);

    if (["lnn", "royalflare", "wr"].includes(page)) {
        style = document.createElement("style");
        style.id = "dark_theme_table";
        style.innerText = "tr:not(.west_tr):nth-child(even),tr.west_tr:nth-child(odd){background-color:#555555;}";
        head.appendChild(style);
    }
}

function ready() {
    if (done) {
        return;
    }

    done = true;

    if (localStorage.theme) { // legacy
        document.cookie = "theme=dark;expires=Fri, 31 Dec 9999 23:59:59 UTC;path=/;sameSite=Strict;Secure;";
        localStorage.removeItem("theme");
        document.getElementById("hy_text").innerHTML = (language == "ja_JP" ? "妖怪モード（ダーク）" : "Youkai mode (Dark)");
        dark();
    }

    if (document.getElementById("hy_link")) {
        document.getElementById("hy_container").innerHTML = document.getElementById("hy_link").innerHTML;
    }
}

function getCookie(name) {
    var decodedCookies, cookieArray, cookie;

    decodedCookies = decodeURIComponent(document.cookie);
    cookieArray = decodedCookies.split(';');
    name += '=';

    for (var i = 0; i < cookieArray.length; i += 1) {
        cookie = cookieArray[i];

        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }

        if (cookie.indexOf(name) === 0) {
            try {
                return JSON.parse(cookie.substring(name.length, cookie.length));
            } catch (err) {
                return JSON.parse("\"" + cookie.substring(name.length, cookie.length) + "\"");
            }
        }
    }

    return "";
}

function theme() {
    if (getCookie("theme") == "dark") {
        document.cookie = "theme=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;" +
        "sameSite=Strict;" + (location.protocol == "https:" ? "Secure;" : "");
        document.getElementById("hy_text").innerHTML = (language == "ja_JP" ? "人間モード（ライト）" : "Human mode (Light)");

        if (document.head.contains(document.getElementById("dark_theme_table"))) {
            head.removeChild(document.getElementById("dark_theme_table"));
        }

        if (document.head.contains(document.getElementById("dark_theme"))) {
            head.removeChild(document.getElementById("dark_theme"));
        } else {
            window.location.reload(false);
        }
    } else {
        var cookieString = ";expires=Fri, 31 Dec 9999 23:59:59 UTC;path=/;sameSite=Strict;";

        if (location.protocol == "https:") {
            cookieString += "Secure;";
        }

        document.cookie = "theme=dark" + cookieString;
        document.getElementById("hy_text").innerHTML = (language == "ja_JP" ? "妖怪モード（ダーク）" : "Youkai mode (Dark)");
        dark();
    }

    if (localStorage.theme) { // legacy
        localStorage.removeItem("theme");
    }
}

head = document.getElementsByTagName("head")[0];
window.addEventListener("DOMContentLoaded", ready, false);
hy = document.getElementById("hy_container");
done = false;
language = "en_US";

if (getCookie("lang") == "ja_JP" || location.href.includes("jp")) {
    language = "ja_JP";
}

if (hy) {
    hy.addEventListener("click", theme);
}
