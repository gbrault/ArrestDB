/**
 * @license Copyright (c) 2016, Gilbert Brault. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview The ArrestDBcmd plugin.
 */

( function() {
	var saveCmd = {
		readOnly: 1,

		exec: function( editor ) {
			if ( editor.fire( 'save' ) ) {
				if(typeof editor.rlite !='undefined'){
					editor.rlite.save(editor);
				}
			}
		}
	};

	var pluginName = 'ArrestDBcmd';

	// Register a plugin named "save".
	CKEDITOR.plugins.add( pluginName, {
		requires: ['menubutton'],
		// jscs:disable maximumLineLength
		lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,de-ch,el,en,en-au,en-ca,en-gb,eo,es,et,eu,fa,fi,fo,fr,fr-ca,gl,gu,he,hi,hr,hu,id,is,it,ja,ka,km,ko,ku,lt,lv,mk,mn,ms,nb,nl,no,pl,pt,pt-br,ro,ru,si,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		// jscs:enable maximumLineLength
		init: function( editor ) {
			var plugin = this;
			function createMenuButton( )
			{
				var items = {};

				// add ArrestDBcmd
					var command = editor.addCommand( 'ArrestDBsave', saveCmd );
					command.modes = { wysiwyg: true };

					items[ 'ArrestDBsave' ] = {
						label: editor.lang.ArrestDBcmd.save,
						command : 'ArrestDBsave',
						group: 'ArrestDBcmd',
						role: 'menuitem'
					};

				// add new command to ArrestDBcmd Menu Group here

				editor.addMenuGroup( 'ArrestDBcmd', 1 );
				editor.addMenuItems( items );

				return {
					label: 'Document Commands',
					icon: plugin.path+'icons/ArrestDBcmd.png',
					toolbar: 'document,10',
					onMenu: function() {
						var activeItems = {};

						for ( var item in items )
							activeItems[ item ] = CKEDITOR.TRISTATE_OFF;

						return activeItems;
					}
				};
			};

			var menuButton = createMenuButton();
			editor.ui.add( 'DocumentCmd',  CKEDITOR.UI_MENUBUTTON, menuButton);

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
