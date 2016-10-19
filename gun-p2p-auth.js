( function( env ) {
    var Gun;
    if( typeof module !== "undefined" && module.exports ) { Gun = require( 'gun/gun' ) }
    if( typeof window !== "undefined" ) { Gun = window.Gun }

    function _getKey( userName ) {
        return 'users/' + userName;
    }

    function _getFroto() {
        return {stringify:function(a){var b={ct:a.ciphertext.toString(CryptoJS.enc.Base64)};a.iv&&(b.iv=a.iv.toString());a.salt&&(b.s=a.salt.toString());return JSON.stringify(b)},parse:function(a){a=JSON.parse(a);var b=CryptoJS.lib.CipherParams.create({ciphertext:CryptoJS.enc.Base64.parse(a.ct)});a.iv&&(b.iv=CryptoJS.enc.Hex.parse(a.iv));a.s&&(b.salt=CryptoJS.enc.Hex.parse(a.s));return b}};
    }

    Gun.chain.p2pAuthLogin = function( userName, password, opt, cb ) {
        var gun = this;
        var key =_getKey( userName );
        var gunNode;

        cb = cb || function() {};
        opt = opt || {};

        if( opt.useGunChain ) {
            gunNode = gun;
        } else {
            gunNode = gun.get( key );
        }

        var loginState = 'checking';

        setTimeout( function() {
            if( loginState === 'checking' ) {
                loginState = 'timeout';
                cb( {
                    status: 'timeout'
                } );
            }
        }, 5000 );

        gunNode.val( function( node ) {
            if( loginState !== 'checking' ) {
            } else {
                var saltString = node.duh;
                var encPrvhex = node.uh;
                var froto = _getFroto();

                // Create a PBKDF2 hash of the password.
                var pwHash2 = CryptoJS.PBKDF2( password, saltString, {
                    keySize: 512 / 32,
                    iterations: 100
                } ).toString( CryptoJS.enc.Base64 );

                // AES decrypt the private key.
                var correctPw = false;
                var prvObj;
                try {
                    var prvhex2 = CryptoJS.AES.decrypt( encPrvhex, pwHash2, { format: froto } ).toString( CryptoJS.enc.Utf8 );
                    prvObj = JSON.parse( prvhex2 );
                    if( prvObj.ky ) {
                        correctPw = true;
                    }
                } catch( e ) {
                }

                loginState = 'checked';

                if( ! correctPw ) {
                    cb( {
                        status: 'error'
                    } );
                } else {
                    loginState = 'loggedin';
                    cb( {
                        status: 'success',
                        prkey: prvObj.ky,
                        usernode: node
                    } );
                }
            }
        } );

        return gun;
    };

    // dorh What can we do when password is forgotten? Share encypted with a friend, like LastPass?
    // dorh What can we do against overwrites by others?
    // dorh make sure pw is at least 8 char long

    Gun.chain.p2pAuthRegister = function( userName, password, opt, cb ) {
        var gun = this;
        var key =_getKey( userName );

        cb = cb || function() {};
        opt = opt || {};

        // Create a new keypair.
        var ec = new KJUR.crypto.ECDSA( { 'curve': 'secp384r1' } ); // or secp256r1
        var keypair = ec.generateKeyPairHex();
        var pubhex = keypair.ecpubhex;
        var prvhex = keypair.ecprvhex;
        var prvObj = {
            'ky': prvhex,
        };

        // Create a PBKDF2 hash of the password.
        var salt = CryptoJS.lib.WordArray.random( 128/8 );
        var saltString = salt.toString();
        var pwHash = CryptoJS.PBKDF2( password, saltString, { keySize: 512/32, iterations: 100 } ).toString( CryptoJS.enc.Base64 );

        // AES encrypt the private key.
        var froto = _getFroto();
        var encPrvhex = CryptoJS.AES.encrypt( JSON.stringify( prvObj ), pwHash, { format: froto } ).toString();

        var res = {
            'username': userName,
            'pubkey': pubhex,
            'duh': saltString,
            'uh': encPrvhex
        };

        if( ! opt.noPut ) {
            gun.put( res ).key( key );
        }

        res.status = 'success';
        cb( res );

        return gun;
    };

} () );