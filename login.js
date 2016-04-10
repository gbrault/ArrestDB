CKEDITOR.dialog.add( 'login', function( editor ) {
    return {
        title:          'User Login & Management',
        resizable:      CKEDITOR.DIALOG_RESIZE_BOTH,
        minWidth:       500,
        minHeight:      400,
        contents: [
            {
                id:         'tabLogin',
                label:      'Login',
                title:      'User Login',
                accessKey:  'Q',
                elements: [
                    {
                        type:           'text',
                        label:          'User ID',
                        id:             'userid',
                        title:          'Enter user ID',
    					validate: function(api) {
        						if ( !this.getValue() ) {
        							editor.say('User ID cannot be empty.');
            						return false;
        						}
    					},
    					setup: function(){
							this.setValue('');
						}
                    },
                    {
    					type: 'password',
    					id: 'password',
    					label: 'password',
    					title: 'Enter password',
    					validate: function(api) {
        						if ( !this.getValue() ) {
        							editor.say('Password cannot be empty.');
            						return false;
        						}
    					},
    					setup: function(){
							this.setValue('');
						}
					},
					{
    					type: 'button',
    					id: 'buttonId',
    					label: 'Log',
    					title: 'Click to Log to Server',
    					onClick: function() {
        					// this = CKEDITOR.ui.dialog.button
        					// alert( 'Clicked: ' + this.id );
        					var suserid = this.getDialog().getContentElement('tabLogin'
        																	,'userid').getValue();
        					var spassword = this.getDialog().getContentElement('tabLogin'
        																	,'password').getValue();
        					if((suserid!='')&&(spassword!='')){
        						var userid=Aes.Ctr.encrypt(suserid, key, 256);
        						var password = Aes.Ctr.encrypt(spassword, key, 256);
        						var url = '/ArrestDB/login.php?action=getuser'+
        						          '&user="'+userid+'"'+
        						          '&password="'+password+'"';
        						var user = CKEDITOR.restajax.getjson(url);
        						if(user.error){
									editor.say(user.error);
								} else {
									// green color feedback, nobeep
									editor.say("ok",'lightgreen',false);
									// store user in global variable
									// user.IdUser = database record unique id
									// user.role = user role (admin,... to be refined)
									// user.First = first name
									// user.Last = last name
									// user.user = user id
									window.user=user;
									PubSub.publish('user',
											        user);
								}
							} else{
								editor.say('UserID and/or Password cannot be empty.');
							}
    					}
					}
                ]
            }
        ]
    };
} );