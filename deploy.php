<?php
/**
 * Git Deployment Script for HostGator
 * Matches remote: origin and branch: main
 */

// Execute the pull command
$output = shell_exec('git pull origin main 2>&1');

// Display the result (useful for testing, but you can remove the echo later for security)
echo "<h2>Deployment Result:</h2>";
echo "<pre>$output</pre>";
?>