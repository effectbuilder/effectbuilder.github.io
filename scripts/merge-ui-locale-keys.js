const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, '..', 'locales');

const ui = {
    notif_sign_in_prompt: 'Sign in to view notifications.',
    notif_empty: 'You have no new notifications.',
    notif_like_html: 'Your effect <strong>{project}</strong> was liked by <strong>{sender}</strong>!',
    notif_comment_html: '<strong>{sender}</strong> commented on your effect <strong>{project}</strong>.',
    notif_generic_html: 'New event: {event} from <strong>{sender}</strong>.',
    notif_timestamp_line: '{time} ago',
    gallery_no_effects: 'No effects found.',
    gallery_by_on: 'By {author} on {date}',
    gallery_anonymous: 'Anonymous',
    gallery_na_date: 'N/A',
    btn_load_effect: 'Load',
    tooltip_load_effect: 'Load Effect',
    btn_like: 'Like',
    btn_liked: 'Liked',
    tooltip_like: 'Like',
    tooltip_unlike: 'Unlike',
    modal_delete_project_title: 'Delete Project',
    modal_delete_project_body: 'Are you sure you want to delete "{name}"?',
    btn_delete: 'Delete',
    gallery_my_effects_title: 'My Effects',
    gallery_load_failed_list: 'Could not load effects.',
    gallery_load_my_failed: 'Could not load your projects.',
    comments_none_yet: 'No comments yet. Be the first!',
    comments_error_loading: 'Error loading comments.',
    comment_posting: 'Posting...',
    confirm_export_fail_body: 'Export failed: ',
    confirm_export_empty: 'No HTML generated.'
};

function merge(name) {
    const p = path.join(localesDir, name);
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    Object.assign(j, ui);
    fs.writeFileSync(p, JSON.stringify(j, null, 4) + '\n');
}
['en.json', 'fr.json', 'de.json', 'pt.json', 'zh-CN.json', 'hi.json'].forEach(merge);

const es = JSON.parse(fs.readFileSync(path.join(localesDir, 'es.json'), 'utf8'));
Object.assign(es, {
    notif_sign_in_prompt: 'Inicia sesión para ver notificaciones.',
    notif_empty: 'No tienes notificaciones nuevas.',
    notif_like_html: '¡A <strong>{project}</strong> le gustó a <strong>{sender}</strong>!',
    notif_comment_html: '<strong>{sender}</strong> comentó en tu efecto <strong>{project}</strong>.',
    notif_generic_html: 'Nuevo evento: {event} de <strong>{sender}</strong>.',
    notif_timestamp_line: 'hace {time}',
    gallery_no_effects: 'No se encontraron efectos.',
    gallery_by_on: 'Por {author} el {date}',
    gallery_anonymous: 'Anónimo',
    gallery_na_date: 'N/D',
    btn_load_effect: 'Cargar',
    tooltip_load_effect: 'Cargar efecto',
    btn_like: 'Me gusta',
    btn_liked: 'Te gusta',
    tooltip_like: 'Me gusta',
    tooltip_unlike: 'Quitar me gusta',
    modal_delete_project_title: 'Eliminar proyecto',
    modal_delete_project_body: '¿Seguro que quieres eliminar «{name}»?',
    btn_delete: 'Eliminar',
    gallery_my_effects_title: 'Mis efectos',
    gallery_load_failed_list: 'No se pudieron cargar los efectos.',
    gallery_load_my_failed: 'No se pudieron cargar tus proyectos.',
    comments_none_yet: 'Sin comentarios aún. ¡Sé el primero!',
    comments_error_loading: 'Error al cargar comentarios.',
    comment_posting: 'Publicando...',
    confirm_export_fail_body: 'Error de exportación: ',
    confirm_export_empty: 'No se generó HTML.'
});
fs.writeFileSync(path.join(localesDir, 'es.json'), JSON.stringify(es, null, 4) + '\n');
console.log('Merged UI keys');
