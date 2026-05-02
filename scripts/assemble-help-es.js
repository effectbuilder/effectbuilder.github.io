const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'help-es');

const titles = {
    help_acc_1_title: 'Panorama de la interfaz',
    help_acc_2_title: 'El lienzo y la barra de herramientas',
    help_acc_3_title: 'Formas y herramientas avanzadas',
    help_acc_4_title: 'Reactividad de audio y sensores',
    help_acc_5_title: 'Guardar, cargar y exportar',
    help_acc_6_title: 'Instalar efectos personalizados en SignalRGB'
};

const html = {
    help_welcome_html: fs.readFileSync(path.join(dir, 'welcome.txt'), 'utf8').trim(),
    help_acc_1_html: fs.readFileSync(path.join(dir, 'acc1.txt'), 'utf8').trim(),
    help_acc_2_html: fs.readFileSync(path.join(dir, 'acc2.txt'), 'utf8').trim(),
    help_acc_3_html: fs.readFileSync(path.join(dir, 'acc3.txt'), 'utf8').trim(),
    help_acc_4_html: fs.readFileSync(path.join(dir, 'acc4.txt'), 'utf8').trim(),
    help_acc_5_html: fs.readFileSync(path.join(dir, 'acc5.txt'), 'utf8').trim(),
    help_acc_6_html: fs.readFileSync(path.join(dir, 'acc6.txt'), 'utf8').trim()
};

const out = path.join(__dirname, 'es-help-overrides.json');
fs.writeFileSync(out, JSON.stringify({ ...titles, ...html }, null, 4));
console.log('Wrote', out);
