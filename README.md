# \<gun-p2p-auth\>

A Gun chain p2p auth script and Polymer component.

## Install with bower

Inside your bower application directory do:
```
$ bower install --save swifty/gun-p2p-auth
```

## Try the Polymer demo

Inside your bower application directory do:
```
$ polymer serve
```
And then in your browser go to:

[http://localhost:8080/bower_components/gun-p2p-auth/demo/index.html](http://localhost:8080/bower_components/gun-p2p-auth/demo/index.html)

## Example usage in a Polymer app

```
<link rel="import" href="../gun-p2p-auth/gun-p2p-auth.html">
<dom-module id="x-foo">
    <template>
        <gun-p2p-auth id="gunp2pauth"></gun-p2p-auth>

        <span style="color:red;">First make sure you have a Gun server running on http://127.0.0.1:8081</span><br><br>
        <span>Then first register a new user with the form below and after that try to login with the form below that.</span>

        <h2>Register form</h2>
        Username:<br>
        <input id="register_username" name="username" value=''><br><br>
        Password:<br>
        <input id="register_password" name="password" type="password" value=''><br><br>
        <button id="register_button" type="button" on-click="doRegister">Register</button>
        <br><br>

        <h2>Login form</h2>
        Username:<br>
        <input id="login_username" name="username" value=''><br><br>
        Password:<br>
        <input id="login_password" name="password" type="password" value=''><br><br>
        <button id="login_button" type="button" on-click="doLogin">Login</button>
        <br><br>
    </template>
    <script>
        Polymer( {
            is: 'x-foo',
            doLogin: function() {
                var userName = document.getElementById( 'login_username' ).value;
                var password = document.getElementById( 'login_password' ).value;
                this.$.gunp2pauth.doLogin( Gun( 'http://127.0.0.1:8081' ), userName, password, {}, function( res ) {
                    alert( 'Login result: ' + res.status );
                } );
            },
            doRegister: function() {
                var userName = document.getElementById( 'register_username' ).value;
                var password = document.getElementById( 'register_password' ).value;
                this.$.gunp2pauth.doRegister( Gun( 'http://127.0.0.1:8081' ), userName, password, {}, function( res ) {
                    alert( 'Register result: ' + res.status );
                } );
            }

        } );
    </script>
</dom-module>
```
