<?php declare(strict_types=1); ?>
<script>
(function () {
    document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var tid = btn.getAttribute('data-copy-target');
            var inp = document.getElementById(tid);
            if (!inp || !inp.value) {
                return;
            }
            navigator.clipboard.writeText(inp.value).then(function () {
                var prev = btn.innerHTML;
                btn.innerHTML = '<i class="bi bi-check2"></i>';
                btn.classList.add('btn-success');
                btn.classList.remove('btn-outline-secondary');
                setTimeout(function () {
                    btn.innerHTML = prev;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-outline-secondary');
                }, 1500);
            });
        });
    });
})();
</script>
