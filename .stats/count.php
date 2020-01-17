<?php
function hit($page) {
    if (file_exists('.stats/token')) {
        $usr = $_SERVER['HTTP_USER_AGENT']
        $token = trim(file_get_contents('.stats/token'));
        $bot = strpos($usr, 'bot') || strpos($usr, 'Google') || strpos($usr, 'W3C') || strpos($_SERVER['HTTP_REFERER'], 'developers.google');
        if ($_SERVER['SERVER_NAME'] !== 'localhost' && $_COOKIE['token'] !== $token && $bot === false) {
            $page = str_replace('.php', '', $page);
            $hitcount = '.stats/' . date('d-m-Y') . '.json';
            if (file_exists($hitcount)) {
                $json = file_get_contents($hitcount);
                $stats = json_decode($json, true);
                if (isset($stats[$page])) {
                    $stats[$page] += 1;
                } else {
                    $stats[$page] = 1;
                }
            } else {
                $stats = array($page => 1);
            }
            $file = fopen($hitcount, 'w');
            fwrite($file, json_encode($stats));
        }
    }
}
?>
