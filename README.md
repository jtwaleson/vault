vault
=====

Vault is an authenticator for the InstaTFA protocol.
It generates and stores an RSA keypair in html5 localStorage, it is entirely client side.
It responds to challenges in the query string, like: ?challenge=[challenge]&callback=http://mysite/response/
It is best used on a device that you always carry with you, like your mobile phone.

More about InstaTFA below.

* Key Generation *

The first time you open a challenge, it will ask you to generate a key.
Entropy is collected by using data from the accelerometer in your device or by moving your cursor across the screen.
Once enough entropy has been collected, an RSA keypair will be generated using the cryptico library.

* Responding to challenges *

If a keypair was stored in localStorage, it will sign the challenge and send the challenge, the public key and the signed challenge to the specified callback uri.


FAQ
-----


InstaTFA
-----
InstaTFA is a protocol for rapid two factor authentication.

The application that requires Two Factor Authentication will request the authenticator to sign a challenge with a known public key, and send the key, challenge and signed challenge and post these back to the application. All communication is over HTTP.
