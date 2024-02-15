<?php

defined('DS') ? null : define("DS", DIRECTORY_SEPARATOR);

defined("SITE_ROOT") ? null : define("SITE_ROOT", realpath(dirname(__FILE__)) . DS . "..");
defined("INC_PATH") ? null : define("INC_PATH", SITE_ROOT . DS . 'includes');
defined("CORE_PATH") ? null : define("CORE_PATH", SITE_ROOT . DS . 'core');
defined("MODELS_PATH") ? null : define("MODELS_PATH", SITE_ROOT . DS . 'models');

require_once(INC_PATH . DS . "config.php");

$models = glob(MODELS_PATH . DS . "*.php");

foreach ($models as $model) {
    require_once $model;
}

?>