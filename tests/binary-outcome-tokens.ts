import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BinaryOutcomeTokens } from "../target/types/binary_outcome_tokens";
import { TOKEN_PROGRAM_ID, createAccount, createMint, mintTo } from "@solana/spl-token";



const CONDITION_AUTH_PDA_SEED = Buffer.from("condition_auth_pda_seed");


let ticketTokenMint: anchor.web3.PublicKey;
let yesToken: anchor.web3.PublicKey;
let noToken: anchor.web3.PublicKey;
let condition: anchor.web3.PublicKey;
let conditionAuthPda: anchor.web3.PublicKey;
let collateralToken: anchor.web3.PublicKey;
let collateralVault: anchor.web3.PublicKey;
let ticketTokenAta: anchor.web3.PublicKey;
let yesTokenAta: anchor.web3.PublicKey;
let noTokenAta: anchor.web3.PublicKey;
let collateralTokenAta: anchor.web3.PublicKey;
let payer = new anchor.web3.Keypair();

const OPTS : anchor.web3.ConfirmOptions = {
    skipPreflight: true,
};

describe("binary-outcome-tokens", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.BinaryOutcomeTokens as Program<BinaryOutcomeTokens>;



    it("Initializing condition", async () => {

        await program.provider.connection.confirmTransaction(await program.provider.connection.requestAirdrop(payer.publicKey, 10_000_000_000));
        await program.provider.connection.confirmTransaction(await program.provider.connection.requestAirdrop(program.provider.publicKey, 1_000_000_00));


        let conditionKeypair = new anchor.web3.Keypair();

        condition = conditionKeypair.publicKey;

        const [authority, _] = anchor.web3.PublicKey.findProgramAddressSync(
            [CONDITION_AUTH_PDA_SEED, conditionKeypair.publicKey.toBuffer()],
            program.programId
        );

        conditionAuthPda = authority;

        ticketTokenMint = await createMint(
            program.provider.connection,
            payer,
            conditionAuthPda,
            null,
            0,
        );

        yesToken = await createMint(
            program.provider.connection,
            payer,
            conditionAuthPda,
            null,
            0,
        );
        noToken = await createMint(
            program.provider.connection,
            payer,
            conditionAuthPda,
            null,
            0,
        );

        collateralToken = await createMint(
            program.provider.connection,
            payer,
            payer.publicKey,
            null,
            0,
        )

        let vaultKeypair = new anchor.web3.Keypair();

        collateralVault = vaultKeypair.publicKey;


        collateralTokenAta = await createAccount(
            program.provider.connection,
            payer,
            collateralToken,
            program.provider.publicKey,
        );

        await mintTo(
            program.provider.connection,
            payer,
            collateralToken,
            collateralTokenAta,
            payer,
            500
        );

        const tx = await program.methods.initializeCondition("test",
            "a random token description",
            "yes",
            "no",
            new anchor.BN(100)).accounts({
                signer: program.provider.publicKey,
                condition,
                conditionAuthPda,
                ticketTokenMint,
                outcomeToken1: yesToken,
                outcomeToken2: noToken,
                collateralToken,
                collateralVault,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                systemProgram: anchor.web3.SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([conditionKeypair, vaultKeypair])
            .
            rpc(OPTS);

        });

    it("Minting tickets", async () => {

        ticketTokenAta = await createAccount(
            program.provider.connection,
            payer,
            ticketTokenMint,
            program.provider.publicKey,
        );

        const tx = await program.methods.mintTicket(new anchor.BN(5)).accounts({
            signer: program.provider.publicKey,
            condition,
            collateralVault,
            conditionAuthPda,
            ticketTokenMint,
            payer: collateralTokenAta,
            receiver: ticketTokenAta,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc(OPTS);
    });

    it("Splitting tickets", async () => {

        yesTokenAta = await createAccount(
            program.provider.connection,
            payer,
            yesToken,
            program.provider.publicKey,
        );

        noTokenAta = await createAccount(
            program.provider.connection,
            payer,
            noToken,
            program.provider.publicKey,
        );


        await program.methods.splitTicket(new anchor.BN(5)).accounts({
            signer: program.provider.publicKey,
            condition,
            conditionAuthPda,
            ticketTokenMint,
            outcome1Token: yesToken,
            outcome2Token: noToken,
            payer: ticketTokenAta,
            receiver1: yesTokenAta,
            receiver2: noTokenAta,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc(OPTS);
    });

    it("Merging tickets", async () => {

        await program.methods.mergeTicket(new anchor.BN(2)).accounts({
            signer: program.provider.publicKey,
            condition,
            conditionAuthPda,
            ticketTokenMint,
            outcome1Token: yesToken,
            outcome2Token: noToken,
            payer1: yesTokenAta,
            payer2: noTokenAta,
            receiver: ticketTokenAta,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc(OPTS);
    }
    );

    it("Redeeming tickets", async () => {

        await program.methods.redeemTicket(new anchor.BN(2)).accounts({
            signer: program.provider.publicKey,
            condition,
            conditionAuthPda,
            ticketTokenMint,
            collateralVault,
            payer: ticketTokenAta,
            receiver: collateralTokenAta,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc(OPTS);
    });

    it("Announce result", async () => {
        await program.methods.announcePayout(new anchor.BN(0)).accounts({
            signer: program.provider.publicKey,
            condition,
            conditionAuthPda,
        }).rpc(OPTS);
    });

    it("Claiming payout", async () => {
        await program.methods.redeemPayout(new anchor.BN(3)).accounts({
            signer: program.provider.publicKey,
            condition,
            conditionAuthPda,
            outcomeToken: yesToken,
            payer: yesTokenAta,
            collateralVault,
            receiver: collateralTokenAta,
            tokenProgram: TOKEN_PROGRAM_ID, 
        }).rpc(OPTS);
    });
});
