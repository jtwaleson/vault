vault
=====

Vault is a browser based authenticator for the InstaTFA protocol.
It generates and stores an RSA keypair in html5 localStorage and is best used on a device that you always carry with you, like your mobile phone.

Because vault is entirely client-side, you can use it on this repo's [github page](http://jtwaleson.github.io/vault/).

InstaTFA
-----
InstaTFA is a protocol for rapid two factor authentication over HTTP, based on RSA.

<img src='http://jtwaleson.github.io/vault/instatfa.png' alt='Diagram for the InstaTFA flow.'/>

### Key Generation

The first time you open a challenge, it will ask you to generate a key.
Entropy is collected by using data from the accelerometer in your device or by moving your cursor across the screen.
Once enough entropy has been collected, an RSA keypair will be generated using the cryptico library.

### Responding to challenges

If a keypair was stored in localStorage, it will sign the challenge and send the challenge, the public key and the signed challenge to the specified callback uri.
