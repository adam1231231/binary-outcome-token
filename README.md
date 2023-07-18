# Binary Outcome Token

this program is an impelementation of a Binary Outcome/Conditional tokens, where it's an application agnostic and to enable multiple use cases for it.

the program is inspired by Etheruem's [Conditional Tokens Framework(CTF)](https://docs.gnosis.io/conditionaltokens/) ERC1155 assets that enable a lot of use cases including prediction markets, and events based trading.

## ! this program was made an experiment and is not audited, use at your own risk !


## Program Overview

highly encourage reading the [gnosis's docs](https://docs.gnosis.io/conditionaltokens/docs/introduction1/) to understand more about the concepts, but the program is made to enable prediction markets/ events futures, where a user can initialize a question, and provide two outcomes, for example:
- will Biden win the 2024 election?
    - outcome 1: yes
    - outcome 2: no

and make each token worth 1 usdc, each user can buy one outcome token for 1 usdc and split it into 2 tokens, a `yes` and a `no` token, they think yes Biden will win, they can sell the `no` token and keep the `yes` token, and vice versa.

and when the election comes and the results are out, the authority(should actually be an oracle) can resolve the condition and announce the winning outcome, and users can redeem their winning outcome tokens for collateral tokens.

the winning token outcome tokens are going to be worth the underlying collateral token, and the losing outcome tokens are going to be worth 0.


## Program Instructions 

1. create condition.
    
    Create a new condition with providing condition name, outcomes and collateral token address and amount, users will be able to mint ticket tokens (base tokens) once condition is created, and split it into outcome tokens, and merge their outcome tokens to a ticket.

    it got an authority that can resolve the condition and distribute the collateral to the winning outcome.

    **!! it's highly incouraged to tweak the update authority and replace it with some kind of oracle or something else that's on chain, trust-less**

2. mint ticket.

    mint ticket tokens (base tokens) for the condition, user pays X amount (specified when creating the condition) of collateral token to mint Y amount of tickets that they specified when sending the transaction.

3. split ticket.

    split ticket tokens into outcome tokens, split it into outcome 1 and outcome 2 tickets, they can split more than one ticket at once.

4. merge ticket.
    
    merge outcome tokens into ticket tokens, merge outcome 1 and outcome 2 tickets into one ticket, they can merge more than one ticket at once.

5. redeem ticket.
    
    redeem ticket tokens for collateral tokens, user can redeem their ticket tokens to get a refund back for their inital deposit, they can redeem more than one ticket at once.

6. resolve condition.
        
    resolve the condition and announce the winning condition, this will stop all minting / redeeming from happening, and will allow users to claim their winnings.

7. redeem payout.
    
    redeem payout for winning outcome, users can redeem their winning outcome tokens for collateral tokens, they can redeem more than one winning outcome token at once, each token can only be claimed once.