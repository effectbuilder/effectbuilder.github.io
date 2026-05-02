<?php
/**
 * Git Deployment Script for HostGator
 * Matches remote: origin and branch: main
 *
 * Must run in this file’s directory so git sees the repo’s .git folder.
 */

declare(strict_types=1);

chdir(__DIR__);

$git = 'git';
if (PHP_OS_FAMILY !== 'Windows' && is_executable('/usr/bin/git')) {
    $git = '/usr/bin/git';
}

$cmd = $git . ' pull origin main 2>&1';
$output = shell_exec($cmd);

if ($output === null) {
    $lines = [];
    $code = 0;
    exec($cmd, $lines, $code);
    $output = $lines !== [] ? implode("\n", $lines) : null;
}

if ($output === null || $output === '') {
    $output = 'No output from git. Possible causes: shell_exec and exec are disabled in PHP '
        . '(HostGator: check MultiPHP INI Editor → disable_functions), or git is not in PATH '
        . 'for the web server user.';
}

header('Content-Type: text/html; charset=utf-8');
echo '<h2>Deployment Result:</h2>';
echo '<pre>' . htmlspecialchars($output, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</pre>';
