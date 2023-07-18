use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::consts::{BINARY_TOKEN_MINT_PDA, CONDITION_PDA_SEED};
use crate::error_codes::ErrorCodes;
use crate::state::{Condition, Outcome};

pub fn initialize_condition(
    ctx: Context<InitializeCondition>,
    name: String,
    description: String,
    outcome_1: String,
    outcome_2: String,
    collateral_per_ticket: u64,
) -> Result<()> {

    ctx.accounts.condition.name = name;
    ctx.accounts.condition.description = description;
    ctx.accounts.condition.active = 1;
    ctx.accounts.condition.outcomes = vec![
        Outcome {
            name: outcome_1,
            token: ctx.accounts.outcome_1_token.key().to_owned(),
            winner: 0,
        },
        Outcome {
            name: outcome_2,
            token: ctx.accounts.outcome_2_token.key().to_owned(),
            winner: 0,
        },
    ];

    ctx.accounts.condition.resolution_auth = ctx.accounts.signer.key();
    ctx.accounts.condition.collateral_token = ctx.accounts.collateral_token.key();
    ctx.accounts.condition.collateral_per_ticket = collateral_per_ticket;
    Ok(())
}

/// Initialize a new condition.
/// expects the following accounts:
/// 0. `[writable, signer]` The signer of the transaction/ the owner of the condition
/// 1. `[writable]` The PDA for the condition, control minting and vault
/// 2. `[]` The base token mint, can be split and merged
/// 3. `[]` The outcome 1 token mint, "half" of base token
/// 4. `[]` The outcome 2 token mint, other "half" of base token
/// 5. `[writable]` The condition account, holds the condition data
/// 6. `[]` The collateral token mint, used to mint base tokens
/// 7. `[writable]` The collateral token vault, holds the collateral tokens
/// 8. `[]` The token program
///
/// expects arguements:
/// 0. `name` The name of the condition
/// 1. `description` The description of the condition
/// 2. `outcome_1` The name of the first outcome
/// 3. `outcome_2` The name of the second outcome
/// 4. `collateral_per_ticket` The amount of collateral tokens needed to mint one ticket

#[derive(Accounts)]
#[instruction(name: String, description: String, outcome_1: String, outcome_2: String, collateral_per_ticket: u64)]
pub struct InitializeCondition<'info> {
    #[account(mut)]
    signer: Signer<'info>,

    #[account(init, payer = signer, seeds = [BINARY_TOKEN_MINT_PDA, base_token.key().as_ref()], bump, space = 9)]
    condition_auth_pda: AccountInfo<'info>,

    #[account(constraint = base_token.decimals > 0 @ ErrorCodes::InvalidTokenMintDecimals,
    constraint = base_token.mint_authority.unwrap() == condition_auth_pda.key())]
    pub base_token: Account<'info, Mint>,

    #[account(constraint = outcome_1_token.decimals > 0 @ ErrorCodes::InvalidTokenMintDecimals,
    constraint = base_token.mint_authority.unwrap() == condition_auth_pda.key() @ ErrorCodes::InvalidTokenMintAuthority)]
    pub outcome_1_token: Account<'info, Mint>,

    #[account(constraint = outcome_2_token.decimals > 0 @ ErrorCodes::InvalidTokenMintDecimals,
    constraint = base_token.mint_authority.unwrap() == condition_auth_pda.key() @ ErrorCodes::InvalidTokenMintAuthority)]
    pub outcome_2_token: Account<'info, Mint>,

    #[account(init, payer = signer, seeds = [CONDITION_PDA_SEED, base_token.key().as_ref()], bump, space = std::mem::size_of::< Condition > ())]
    pub condition: Box<Account<'info, Condition>>,

    pub collateral_token: Account<'info, Mint>,

    #[account(init, payer = signer,token::mint= collateral_token, token::authority = condition_auth_pda)]
    pub collateral_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
