<?php
$errors = ['401', '403', '404', '500'];
function check_webp() {
    if ( strpos( $_SERVER['HTTP_ACCEPT'], 'image/webp' ) !== false ) {
        return 'webp';
    }
    return 'no-webp';
}
function hit($page) {
    $path = (in_array($page, $errors) ? '../../.stats/token' : '.stats/token');
    if (file_exists($path)) {
        if (!empty($_SERVER['HTTP_USER_AGENT']) && preg_match('~(bot|crawl|slurp|spider|archiver|facebook|lighthouse|jigsaw|validator|w3c|hexometer)~i', $_SERVER['HTTP_USER_AGENT'])) {
            return;
        }
        $token = trim(file_get_contents('.stats/token'));
        if ($_SERVER['SERVER_NAME'] !== 'localhost' && $_COOKIE['token'] !== $token) {
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