<?php
require 'php-crud-api.php';
$config = include 'db_config.php';
$api = new Tqdev\PhpCrudApi\Api(new Tqdev\PhpCrudApi\Config($config));
$response = $api->handle(Tqdev\PhpCrudApi\RequestFactory::fromGlobals());
Tqdev\PhpCrudApi\ResponseUtils::output($response);
