# WebLN Sandbox

[DEMO](https://rolznz.github.io/webln-sandbox/)

## Using the Sandbox (Regtest)

- Install Alby from source. See [Setup](https://github.com/getAlby/lightning-browser-extension/blob/master/doc/SETUP.md))
- Install Polar See [Connecting with Polar](https://github.com/getAlby/lightning-browser-extension/wiki/Start-the-lightning-network-test-environment-locally-and-link-to-the-Alby)
  - Create a simnet with 1 Bitcoin core and 2 Lightning nodes.
  - Open the bitcoin core node and from the "Actions" tab manually mine 100 blocks
  - Open the Alice Lightning node and from the "Actions" tab deposit 1M sats
  - In Alby, add a new account, choose LND
    - in Polar copy Alice's REST host address and (Hex)Admin Macaroon
    - Enable insecure localhost if you have certificate issues chrome://flags/#allow-insecure-localhost
  - Your new Wallet should have 0 balance (currently Alice only has onchain bitcoin)
  - Add the Bob Lightning node as another account to your Alby wallet.

## Development

- `yarn install`
- `yarn dev`

Boostrapped with [Vite](https://vitejs.dev/guide/)
