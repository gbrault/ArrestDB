/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview The ArrestDBsave plugin.
 */

( function() {
	var saveCmd = {
		readOnly: 1,

		exec: function( editor ) {
			if ( editor.fire( 'save' ) ) {
				var docref = window.location.search.substring(1);
				if(!!docref){
					var doccontent = editor.getData();
					// get the id of the current document
					var doc=CKEDITOR.restajax.getjson("/ArrestDB/ArrestDB.php/Documents/name/"+docref);
					if(!doc.hasOwnProperty("error")){
						CKEDITOR.restajax.putjson("/ArrestDB/ArrestDB.php/Documents/"+doc[0].id,
											{content:doccontent}
											);
					}
				}
			}
		}
	};

	var pluginName = 'ArrestDBsave';

	// Register a plugin named "save".
	CKEDITOR.plugins.add( pluginName, {
		// jscs:disable maximumLineLength
		lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,de-ch,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		// jscs:enable maximumLineLength
		icons: 'ArrestDBsave', // %REMOVE_LINE_CORE%
		// hidpi: true, // %REMOVE_LINE_CORE%
		init: function( editor ) {
			// Save plugin is for replace mode only.
			if ( editor.elementMode != CKEDITOR.ELEMENT_MODE_REPLACE )
				return;

			var command = editor.addCommand( pluginName, saveCmd );
			command.modes = { wysiwyg: true };

			editor.ui.addButton && editor.ui.addButton( 'ArrestDBsave', {
				label: editor.lang.ArrestDBsave.toolbar,
				command: pluginName,
				toolbar: 'document,10'
			} );
		}
	} );
} )();

/**
 * Fired when the user clicks the Save button on the editor toolbar.
 * This event allows to overwrite the default Save button behavior.
 *
 * @since 4.2
 * @event save
 * @member CKEDITOR.editor
 * @param {CKEDITOR.editor} editor This editor instance.
 */
