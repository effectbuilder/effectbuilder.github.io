<?php
/**
 * Copy this file to deploy-config.local.php (not committed) and fill in values.
 *
 * GitHub → Settings → Developer settings → Personal access tokens:
 *   - Classic: enable "repo" scope for private repos.
 *   - Fine-grained: repository access to this repo, Contents: Read (and Metadata).
 *
 * Optional: set the same secret in GitHub webhook → Secret, to verify requests.
 */
return [
    'github_token' => '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',
    'webhook_secret' => '87e290d457824d6bf6ee03b13effb93d63c1998e68c273de42e659788adc56f1',
];
