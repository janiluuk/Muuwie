<?

$data = file_get_contents("http://gonzales.vifi.ee/site/webcontent");

$content = json_decode($data, true);

extract($content);


include_once("index.html");

