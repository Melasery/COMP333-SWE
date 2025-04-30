<?php
require __DIR__ . "/inc/bootstrap.php";

// Handle CORS preflight requests early
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    exit(0);
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Special case: /chat/ask — GPT chatbot
if (preg_match('/\/chat\/ask$/', $uri)) {
    require PROJECT_ROOT_PATH . "/Controller/Api/ChatController.php";
    $chatController = new ChatController();
    $chatController->askAction();
    exit();
}

// Special case: /recommendation/auto
if (preg_match('/\/recommendation\/auto$/', $uri)) {
    require PROJECT_ROOT_PATH . "/Controller/Api/RecommendationController.php";
    $recController = new RecommendationController();
    $recController->autoAction();
    exit();
}

// General route handling
$uri = explode('/', $uri);
if (!isset($uri[2]) || !isset($uri[3])) {
    header("HTTP/1.1 404 Not Found");
    exit();
}

$controllerName = ucfirst($uri[2]) . 'Controller';
$controllerFile = PROJECT_ROOT_PATH . "/Controller/Api/" . $controllerName . ".php";

if (!file_exists($controllerFile)) {
    header("HTTP/1.1 404 Not Found");
    exit();
}

require $controllerFile;
$controller = new $controllerName();
$strMethodName = $uri[3] . 'Action';
$controller->{$strMethodName}();

