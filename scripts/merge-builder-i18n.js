/**
 * One-off merge: adds Component Builder / gallery i18n keys to all locale JSON files.
 * Run from repo root: node scripts/merge-builder-i18n.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOCALES = path.join(ROOT, 'locales');
const RUNTIME_KEYS = require('./builder-runtime-i18n-keys.js');

function extractHelpModalBody() {
    const html = fs.readFileSync(path.join(ROOT, 'builder', 'index.html'), 'utf8');
    const i = html.indexOf('<div class="modal fade" id="help-modal"');
    const sub = html.slice(i);
    const mb = sub.match(/<div class="modal-body">([\s\S]*?)<\/div>\s*<div class="modal-footer">/);
    if (!mb) throw new Error('Could not extract help modal body');
    return mb[1].trim().replace(/\r\n/g, '\n');
}

const STATIC_KEYS = {
    builder_page_title: 'RGBJunkie Component Builder: Create custom components for SignalRGB!',
    builder_og_title: 'RGBJunkie Component Builder | Custom SignalRGB Layouts',
    builder_og_description:
        'Design, build, and export custom LED component layouts for SignalRGB. Take full control of your lighting setup with our easy-to-use visual builder.',
    builder_gallery_page_title: 'Community Gallery — RGBJunkie Component Builder',
    builder_gallery_og_title: 'RGBJunkie Component Builder | Custom SignalRGB Components',
    builder_gallery_og_description:
        'Browse, share, and discover custom LED component layouts for SignalRGB created by the community.',
    effect_gallery_page_title: 'Community Gallery — RGBJunkie Interactive Effect Builder',
    effect_gallery_og_title: 'Community Gallery — RGBJunkie Interactive Effect Builder',
    effect_gallery_og_description:
        'Browse public effects created with the RGBJunkie Interactive Effect Builder.',
    builder_about_modal_title: 'About RGBJunkie Component Builder',
    builder_about_intro_html:
        '<p><strong>RGBJunkie Component Builder</strong> is a web-based visual tool designed to simplify the creation of custom component <code>.json</code> files for the <a href="https://signalrgb.com/" target="_blank">SignalRGB</a> platform.</p>',
    builder_about_author_html:
        '<p>Built by José A. Miranda Vélez in the beautiful island of Puerto Rico, this project aims to provide an intuitive, grid-based interface for designers and enthusiasts to map out LEDs for their custom devices.</p>',
    builder_about_related_label: 'Related Tool:',
    builder_about_credits_heading: 'Credits & Technology',
    builder_about_credits_html:
        '<p>This tool is built using <a href="https://firebase.google.com/" target="_blank">Firebase</a> for cloud storage and authentication, and <a href="https://getbootstrap.com/" target="_blank">Bootstrap</a> for the user interface.</p>',
    builder_help_modal_title: 'Help & Quick Guide',
    builder_help_close_btn: 'Close Guide',
    builder_gallery_help_body_html:
        '<p>This is the <strong>Community Gallery</strong>. Here you can browse components created by other users.</p>\n<ul class="list-group">\n<li class="list-group-item">Click <strong>"Load"</strong> on any component to open it in the <strong>Component Builder</strong>.</li>\n<li class="list-group-item">Use the <strong>filters</strong> to search for specific components.</li>\n<li class="list-group-item">If you are signed in, you can <strong>delete</strong> your own components from this page.</li>\n<li class="list-group-item">Click <strong>"Go to Builder"</strong> in the top navigation bar to return to the editor.</li>\n</ul>',
    builder_gallery_help_title: 'Help & Quick Guide',
    builder_gallery_got_it: 'Got it!',
    builder_nav_tooltip_builder: 'Go to Component Builder',
    builder_nav_tooltip_effect_gallery: 'Effect community gallery',
    builder_nav_tooltip_showcase: 'Effect Showcase',
    builder_nav_btn_builder: 'Builder',
    builder_nav_btn_github: 'GitHub',
    builder_nav_tooltip_github: 'Report Bug / Request Feature',
    builder_tooltip_new_component: 'New Component',
    builder_tooltip_open_community: 'Browse components made by the community',
    builder_tooltip_save_component: 'Save Component',
    builder_tooltip_share_component: 'Share Component',
    builder_tooltip_import_json: 'Import Component JSON File',
    builder_btn_import: 'Import',
    builder_tooltip_export_component: 'Export Component JSON File',
    builder_tooltip_help_shortcuts: 'Help & Shortcuts',
    builder_tooltip_about_rgbjunkie: 'About RGBJunkie',
    builder_tab_properties: 'Properties',
    builder_tab_build: 'Build',
    builder_badge_new: 'New',
    builder_shape_moved_alert_html:
        '<strong><i class="bi bi-info-circle-fill me-1"></i> Update:</strong> Shape generators have moved to the <strong>Build</strong> tab!',
    builder_label_product_name: 'Product Name',
    builder_label_display_name: 'Display Name',
    builder_label_brand: 'Brand',
    builder_label_type: 'Type',
    builder_placeholder_example_product: 'e.g., My Custom Fan',
    builder_placeholder_example_brand: 'e.g., Custom',
    builder_label_device_image: 'Device Image',
    builder_image_paste_zone_title: 'Click here and press Ctrl+V to paste an image',
    builder_image_paste_placeholder_html:
        '<i class="bi bi-cloud-arrow-up fs-2 text-primary"></i><br>Click to paste or drop',
    builder_image_paste_hint: 'Use <kbd>Ctrl</kbd> + <kbd>V</kbd> to paste. Max 400x400px.',
    builder_led_header_warning:
        'Most motherboard ARGB headers support ~120 LEDs. Proceed with caution!',
    builder_quick_add_shapes: 'Quick Add Shapes',
    builder_tooltip_add_matrix: 'Add Matrix Shape',
    builder_shape_matrix: 'Matrix',
    builder_tooltip_add_strip: 'Add Strip Shape',
    builder_shape_strip: 'Strip',
    builder_tooltip_add_circle: 'Add Circle Shape',
    builder_shape_circle: 'Circle',
    builder_tooltip_l_shape: 'L Shape',
    builder_shape_l: 'L Shape',
    builder_tooltip_u_shape: 'U Shape',
    builder_shape_u: 'U Shape',
    builder_tooltip_triangle: 'Triangle Shape',
    builder_shape_triangle: 'Triangle',
    builder_tooltip_hexagon: 'Hexagon Shape',
    builder_shape_hexagon: 'Hexagon',
    builder_toolbar_tools: 'Tools',
    builder_toolbar_guide: 'Guide',
    builder_aria_canvas_tools: 'Canvas tools',
    builder_aria_selection_transforms: 'Selection transforms',
    builder_aria_guide_image: 'Guide image',
    builder_aria_grid_indexing: 'Grid and indexing',
    builder_aria_zoom_controls: 'Zoom',
    builder_tooltip_select_tool: 'Select Tool (V)',
    builder_tooltip_place_led: 'Place LED Tool (P)',
    builder_tooltip_wiring_tool: 'Wiring Tool (W)',
    builder_tooltip_rotate_selected: 'Rotate Selected (+90° CCW)',
    builder_tooltip_reverse_wiring: 'Reverse Wiring (R)',
    builder_tooltip_scale_selected: 'Scale Selected (S)',
    builder_tooltip_duplicate_selected: 'Duplicate Selected (D)',
    builder_tooltip_mirror_h: 'Mirror horizontally — flip left/right (M)',
    builder_tooltip_mirror_v: 'Mirror vertically — flip up/down (Shift+M)',
    builder_tooltip_guide_upload: 'Upload/Replace Guide',
    builder_tooltip_guide_move: 'Move/Scale Guide (I)',
    builder_tooltip_guide_unlock: 'Unlock Guide (L)',
    builder_tooltip_guide_hide: 'Hide Guide (H)',
    builder_tooltip_guide_remove: 'Remove Guide',
    builder_tooltip_toggle_grid: 'Toggle Grid (G)',
    builder_tooltip_node_start: 'Toggle Node 0/1 (N)',
    builder_tooltip_zoom_out: 'Zoom Out (-)',
    builder_tooltip_zoom_reset: 'Reset Zoom (0)',
    builder_tooltip_zoom_in: 'Zoom In (+)',
    builder_mobile_comp_placeholder_name: 'Component Name',
    builder_mobile_by_prefix: 'By:',
    builder_desktop_untitled_component: 'Untitled Component',
    builder_bullet_sep: '•',
    builder_led_count_zero: '0 LEDs',
    builder_alt_device: 'Device',
    builder_alt_image_preview: 'Image Preview',
    builder_tooltip_like_component: 'Like Component',
    builder_tooltip_total_views: 'Total Views',
    builder_tooltip_total_downloads: 'Total Downloads',
    builder_btn_toggle_comments: 'Comments',
    builder_placeholder_comment: 'Write a comment...',
    builder_sign_in_conversation_html:
        'Please <button class="btn btn-link p-0" id="comment-login-link">sign in</button> to join the conversation.',
    builder_gallery_offcanvas_title: 'Open Component',
    builder_gallery_search_placeholder: 'Search by name...',
    builder_export_modal_title: 'Export Component',
    builder_export_circuit_warning_html:
        '<i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Notice:</strong> This component contains multiple circuits. This may not be supported by all formats. Make sure to select a compatible export format and test your component after importing.',
    builder_export_format_label: 'Export Format:',
    builder_export_format_srgb: 'SignalRGB (Standard)',
    builder_export_format_wled: 'WLED (Matrix Map)',
    builder_export_format_nollie: 'NollieRGB v2.0',
    builder_export_json_preview: 'Your component JSON preview:',
    builder_share_modal_title: 'Share Component',
    builder_share_modal_intro:
        'Anyone with this link can view and fork this component. Your original component will not be affected.',
    builder_share_modal_hint_html:
        'Direct SignalRGB <strong>.json</strong> download (opens the builder, then saves the file): add <code class="user-select-all">&amp;export=rgbjunkie</code> to the same URL, for example <code class="user-select-all">?id=…&amp;export=rgbjunkie</code>.',
    builder_share_generating: 'Generating link...',
    builder_btn_copy_json: 'Copy JSON',
    builder_btn_download_json: 'Download .json',
    builder_btn_copy_share_link: 'Copy Link',
    builder_add_matrix_title: 'Add LED Matrix',
    builder_add_matrix_intro: 'A grid of LEDs will be created at the center of your view.',
    builder_label_columns: 'Columns',
    builder_label_rows: 'Rows',
    builder_label_wiring_direction: 'Wiring Direction',
    builder_matrix_wiring_horizontal: 'Horizontal (Left-to-Right)',
    builder_matrix_wiring_vertical: 'Vertical (Top-to-Bottom)',
    builder_matrix_serpentine: 'Serpentine Wiring',
    builder_matrix_serpentine_help:
        'If checked, wiring snakes back and forth. If unchecked, each line starts from the beginning.',
    builder_btn_create_matrix: 'Create Matrix',
    builder_add_strip_title: 'Add LED Strip',
    builder_label_led_count: 'LED Count',
    builder_label_orientation: 'Orientation',
    builder_orientation_horizontal: 'Horizontal',
    builder_orientation_vertical: 'Vertical',
    builder_btn_create_strip: 'Create Strip',
    builder_add_circle_title: 'Add LED Circle',
    builder_label_radius: 'Radius (grid units)',
    builder_btn_create_circle: 'Create Circle',
    builder_add_l_shape_title: 'Add L-Shape',
    builder_l_shape_help:
        'Creates an L-shape with the corner at the bottom-left. Wiring runs top-to-bottom, then left-to-right.',
    builder_label_side_a_vertical: 'Side A (Vertical)',
    builder_label_side_b_horizontal: 'Side B (Horizontal)',
    builder_btn_create_l_shape: 'Create L-Shape',
    builder_add_u_shape_title: 'Add U-Shape',
    builder_u_shape_help: 'Wiring runs down Side A, across Side B, and up Side C.',
    builder_label_side_a_left: 'Side A (Left)',
    builder_label_side_b_bottom: 'Side B (Bottom)',
    builder_label_side_c_right: 'Side C (Right)',
    builder_btn_create_u_shape: 'Create U-Shape',
    builder_add_hexagon_title: 'Add Hexagon',
    builder_label_leds_per_side: 'LEDs per Side',
    builder_btn_create_hexagon: 'Create Hexagon',
    builder_add_triangle_title: 'Add Triangle',
    builder_btn_create_triangle: 'Create Triangle',
    builder_scale_modal_title: 'Scale Selected LEDs',
    builder_scale_modal_intro:
        '<p>Scale the selection relative to its <strong>geometric center</strong>.</p>',
    builder_led_count_single: '{count} LED',
    builder_led_count_plural: '{count} LEDs',
    builder_label_scale_factor: 'Scale Factor',
    builder_btn_scale: 'Scale',
    builder_save_conflict_title: 'Save Component',
    builder_btn_overwrite_existing: 'Overwrite Existing',
    builder_btn_save_as_new: 'Save as New',
    builder_tooltip_toggle_comments: 'Toggle Comments',
    builder_accept_terms_body_html:
        '<p>By using this tool, you agree to the <a href=\"#\" data-bs-toggle=\"modal\" data-bs-target=\"#terms-modal\" data-bs-dismiss=\"modal\">Terms of Usage</a> and acknowledge our <a href=\"#\" data-bs-toggle=\"modal\" data-bs-target=\"#privacy-policy-modal\" data-bs-dismiss=\"modal\">Privacy Policy</a>.</p>',
    builder_privacy_short_heading_collect: 'Information We Collect',
    builder_terms_short_intro:
        'By using this Interactive Effect Builder (the "Tool"), you agree to the following terms:',
    builder_terms_short_section1: '1. No Warranty',
    builder_terms_short_body1:
        'This Tool is provided "as-is", without any warranties of any kind...',
    builder_terms_short_section2: '2. Public Content and Licensing',
    builder_terms_short_body2:
        'By saving or sharing an effect, you are making it public. You grant a perpetual, worldwide, non-exclusive, royalty-free license to other users and to this website to use, display, reproduce, and distribute your created effect. This allows features like the Community Gallery to function.',
    builder_privacy_short_intro: '<p><em>Last Updated: November 3, 2025</em></p>',
    builder_privacy_short_collect_heading: 'Information We Collect',
    builder_privacy_short_collect_html:
        '<ul><li><strong>Account Information:</strong> If you choose to sign in with Google, we collect your public profile information, including your name, photo, and unique user ID.</li><li><strong>User-Generated Content:</strong> We collect the components you save to the cloud.</li></ul>',
    notifications_clear_read_tooltip: 'Delete all read notifications',
    notifications_clear_read_btn: 'Clear Read',
    builder_component_type_aio_liquid_cooler: 'AIO Liquid Cooler',
    builder_component_type_air_cooler: 'Air Cooler',
    builder_component_type_case: 'Case',
    builder_component_type_desk: 'Desk',
    builder_component_type_fan: 'Fan',
    builder_component_type_gpu: 'GPU',
    builder_component_type_headset: 'Headset',
    builder_component_type_headset_stand: 'Headset Stand',
    builder_component_type_keyboard: 'Keyboard',
    builder_component_type_matrix: 'Matrix',
    builder_component_type_motherboard: 'Motherboard',
    builder_component_type_monitor: 'Monitor',
    builder_component_type_mouse: 'Mouse',
    builder_component_type_mousepad: 'Mousepad',
    builder_component_type_psu: 'PSU',
    builder_component_type_ram: 'RAM',
    builder_component_type_speaker: 'Speaker',
    builder_component_type_storage: 'Storage',
    builder_component_type_strimer: 'Strimer',
    builder_component_type_strip: 'Strip',
    builder_component_type_other: 'Other',
    effect_gallery_heading: 'Community Gallery',
    effect_gallery_intro:
        'Browse public effects created by the community. Click the "Load" button on any effect to open it in the editor.',
    effect_gallery_tab_all: 'All Effects',
    effect_gallery_tab_liked: 'My Favorite Effects',
    effect_gallery_back_editor: 'Back to Editor',
    effect_gallery_sort_prefix: 'Sort By:',
    effect_gallery_edit_modal_title: 'Edit Effect Details',
    effect_gallery_label_effect_name: 'Effect Name',
    effect_gallery_label_description: 'Description',
    effect_gallery_btn_save_changes: 'Save Changes',
    effect_gallery_end_of_results: 'End of results.',
    builder_gallery_filter_type: 'Type',
    builder_gallery_filter_brand: 'Brand',
    builder_gallery_filter_led_count: 'LED Count',
    builder_gallery_filter_sort: 'Sort By',
    builder_gallery_filter_all_types: 'All Types',
    builder_gallery_filter_all_brands: 'All Brands',
    builder_gallery_filter_all_counts: 'All Counts',
    builder_gallery_sort_newest: 'Newest',
    builder_gallery_sort_likes: 'Most Likes',
    builder_gallery_sort_views: 'Most Views',
    builder_gallery_sort_downloads: 'Most Downloads',
    builder_gallery_clear_filters_tooltip: 'Clear Filters',
    builder_gallery_end_of_list: "You've reached the end of the list."
};

function sortKeys(obj) {
    return Object.keys(obj)
        .sort()
        .reduce(function (o, k) {
            o[k] = obj[k];
            return o;
        }, {});
}

function main() {
    const helpBody = extractHelpModalBody();
    const keys = Object.assign({}, STATIC_KEYS, RUNTIME_KEYS, { builder_help_modal_body_html: helpBody });

    const localeFiles = ['en.json', 'es.json', 'fr.json', 'de.json', 'pt.json', 'zh-CN.json', 'hi.json'];
    const enPath = path.join(LOCALES, 'en.json');
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    Object.assign(en, keys);
    fs.writeFileSync(enPath, JSON.stringify(sortKeys(en), null, 4) + '\n', 'utf8');

    const keyNames = Object.keys(keys);
    for (const f of localeFiles) {
        if (f === 'en.json') continue;
        const p = path.join(LOCALES, f);
        const j = JSON.parse(fs.readFileSync(p, 'utf8'));
        keyNames.forEach(function (k) {
            j[k] = en[k];
        });
        fs.writeFileSync(p, JSON.stringify(sortKeys(j), null, 4) + '\n', 'utf8');
    }

    console.log('Merged', keyNames.length, 'keys into', localeFiles.join(', '));
}

main();
