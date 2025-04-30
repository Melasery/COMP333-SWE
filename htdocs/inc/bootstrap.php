<?php
define("PROJECT_ROOT_PATH", __DIR__ . "/../");

// Include main configuration file
require_once PROJECT_ROOT_PATH . "/inc/config.php";

// Include base controller
require_once PROJECT_ROOT_PATH . "/Controller/Api/BaseController.php";

// Include model files
require_once PROJECT_ROOT_PATH . "/Model/Database.php";
require_once PROJECT_ROOT_PATH . "/Model/UserModel.php";
require_once PROJECT_ROOT_PATH . "/Model/RatingModel.php";
require_once PROJECT_ROOT_PATH . "/Model/DataModel.php";
require_once PROJECT_ROOT_PATH . "/Model/ChatModel.php";
