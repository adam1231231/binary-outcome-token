use anchor_lang::prelude::*;


pub fn split_ticket(ctx : Context<SplitTicket>) -> Result<()>{
    Ok(())
}




#[derive(Accounts)]
pub struct SplitTicket<'info> {
    signer : Signer<'info>,
}